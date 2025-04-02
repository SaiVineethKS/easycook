import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { app } from '../config/firebase';

// Initialize the Vertex AI service
const vertexAI = getVertexAI(app);

// Create a GenerativeModel instance with the gemini-2.0-flash model
const model = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });

// Base system prompt without URL-specific instructions
const SYSTEM_PROMPT = `You are a professional chef and recipe expert. Create a detailed recipe in JSON format.

Return ONLY a valid JSON object without any markdown formatting, explanations, or extra text. Use this exact structure:
{
  "title": "Recipe name",
  "ingredients": [
    { 
      "name": "ingredient name (be specific)",
      "quantity": "amount (e.g., '2 medium-sized', '1 cup', '2 tablespoons')"
    }
  ],
  "procedure": [
    "Step 1: Detailed cooking instruction",
    "Step 2: Include timing, temperature, and technique details",
    "Continue with all necessary steps..."
  ],
  "timestamps": [
    {
      "step": 1,
      "timestamp": "00:00"
    }
  ]
}

CRITICAL FORMATTING INSTRUCTIONS:
1. Output just the raw JSON object - do not use markdown code blocks
2. Do not include any explanation text before or after the JSON
3. Ensure the JSON is properly formatted with correct quotes, commas, and braces
4. Never return "Not specified" or empty values
5. If exact quantities aren't given, provide reasonable estimates
6. Include all necessary cooking steps with timing and temperature details
7. For YouTube videos, include timestamps for each step when possible`;

// Helper function to suggest tags based on recipe content
function suggestTags(recipe: {
  title: string;
  ingredients: { name: string; quantity: string }[];
  procedure: string[];
}): string[] {
  const suggestedTags: Set<string> = new Set();
  const content = (
    recipe.title.toLowerCase() + ' ' +
    recipe.ingredients.map(i => i.name.toLowerCase()).join(' ') + ' ' +
    recipe.procedure.join(' ').toLowerCase()
  );

  // Meal type tags
  if (content.includes('breakfast') || content.includes('pancake') || content.includes('eggs') || content.includes('toast')) {
    suggestedTags.add('breakfast');
  }
  if (content.includes('lunch') || content.includes('sandwich') || content.includes('salad')) {
    suggestedTags.add('lunch');
  }
  if (content.includes('dinner') || content.includes('curry') || content.includes('roast')) {
    suggestedTags.add('dinner');
  }
  if (content.includes('snack') || content.includes('chips') || content.includes('cookies')) {
    suggestedTags.add('snack');
  }

  // Diet type tags
  if (content.includes('protein') || content.includes('chicken') || content.includes('fish') || content.includes('meat')) {
    suggestedTags.add('high protein');
  }
  if (!content.includes('sugar') && !content.includes('bread') && !content.includes('pasta')) {
    suggestedTags.add('low carb');
  }
  if (!content.includes('meat') && !content.includes('chicken') && !content.includes('fish')) {
    suggestedTags.add('vegetarian');
  }
  if (content.includes('quick') || content.includes('easy') || content.includes('minutes')) {
    suggestedTags.add('quick & easy');
  }
  if (content.includes('healthy') || content.includes('salad') || content.includes('grilled')) {
    suggestedTags.add('healthy');
  }

  return Array.from(suggestedTags);
}

export async function parseRecipe(input: string): Promise<{
  title: string;
  ingredients: { name: string; quantity: string }[];
  procedure: string[];
  aiResponse?: string;
  suggestedTags: string[];
}> {
  try {
    console.log('\n=== Starting Recipe Processing ===');
    console.log('Input:', input);

    const isYouTubeUrl = input.includes('youtube.com') || input.includes('youtu.be');
    const userPrompt = isYouTubeUrl 
      ? 'Extract recipe from this video'
      : `Parse recipe from this description: ${input}`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
    console.log('\n=== Full Prompt ===');
    console.log(fullPrompt);

    // Generate content with the Vertex AI model
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('\n=== Raw Vertex AI Response ===');
    console.log(text);

    // Extract JSON from the response using multiple patterns
    let cleanJson = '';
    
    // Try to match JSON in markdown code block format (```json ... ```)
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/);
    if (codeBlockMatch) {
      cleanJson = codeBlockMatch[1].trim();
    } 
    // Try to extract JSON with surrounding non-code text
    else {
      // Look for a JSON-like structure - find the first { and the last }
      const openBraceIndex = text.indexOf('{');
      const closeBraceIndex = text.lastIndexOf('}');
      
      if (openBraceIndex !== -1 && closeBraceIndex !== -1 && openBraceIndex < closeBraceIndex) {
        cleanJson = text.substring(openBraceIndex, closeBraceIndex + 1).trim();
      } else {
        console.error('No JSON structure found in the response, attempting fallback extraction');
      }
    }
    
    // Validate JSON with a quick test parse before proceeding
    try {
      if (cleanJson) {
        JSON.parse(cleanJson);
        console.log('\n=== Valid JSON extracted ===');
      } else {
        throw new Error('No JSON structure extracted');
      }
    } catch (error) {
      console.error('Extracted JSON is invalid or not found:', cleanJson);
      console.error('Attempting alternate extraction methods...');
      
      // Try more aggressive pattern matching
      const possibleJsonPattern = /\{\s*"title"\s*:.+\}/s;
      const possibleMatch = text.match(possibleJsonPattern);
      
      if (possibleMatch) {
        cleanJson = possibleMatch[0];
        // Validate this extracted JSON
        try {
          JSON.parse(cleanJson);
          console.log('\n=== Valid JSON extracted using fallback method ===');
        } catch (innerError) {
          console.error('Fallback JSON extraction also failed, will use regex fallback');
          cleanJson = text; // Use the full text for regex fallback
        }
      } else {
        cleanJson = text; // Use the full text for regex fallback
      }
    }
    
    console.log('\n=== Cleaned JSON ===');
    console.log(cleanJson);
    
    try {
      const parsedRecipe = JSON.parse(cleanJson);
      const suggestedTags = suggestTags(parsedRecipe);
      
      return {
        ...parsedRecipe,
        aiResponse: text,
        suggestedTags
      };
    } catch (jsonError) {
      console.error('Failed to parse JSON from response:', jsonError);
      console.error('Attempted to parse:', cleanJson);
      
      // Try to extract recipe information using regex as a fallback
      const titleMatch = text.match(/title["\s:]+([^",}\n]+)/i);
      const title = titleMatch ? titleMatch[1].trim() : "Untitled Recipe";
      
      // Extract ingredients
      const ingredientsMatch = text.match(/ingredients["\s:]+\[([\s\S]*?)\]/i);
      const ingredientsText = ingredientsMatch ? ingredientsMatch[1] : "";
      const ingredients = extractIngredientsFromText(ingredientsText);
      
      // Extract procedure
      const procedureMatch = text.match(/procedure["\s:]+\[([\s\S]*?)\]/i);
      const procedureText = procedureMatch ? procedureMatch[1] : "";
      const procedure = extractProcedureFromText(procedureText);
      
      return {
        title,
        ingredients,
        procedure,
        aiResponse: text,
        suggestedTags: []
      };
    }
  } catch (error) {
    console.error('\n=== Error Processing Recipe ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error('Failed to process recipe. Please try again.');
  }
}

export async function parseRecipeFromAudio(audioFile: File): Promise<{
  title: string;
  ingredients: { name: string; quantity: string }[];
  procedure: string[];
  aiResponse?: string;
}> {
  try {
    console.log('Processing audio recording:', audioFile.name, 'type:', audioFile.type);

    // For audio processing, we need to convert the audio to text first
    // This is a simplified approach - in a real app, you might use a separate speech-to-text service
    const prompt = `${SYSTEM_PROMPT}\n\nListen to this audio recording and extract the recipe details. Format the response as a JSON object according to the structure above.`;
    
    // Note: In a real implementation, you would need to handle audio files differently
    // This is a placeholder for the actual implementation
    const base64Data = await fileToBase64(audioFile);
    
    // Use the correct format for multimodal content
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: audioFile.type, data: base64Data } }
    ]);
    
    const response = result.response;
    const text = response.text();
    
    console.log('Parsed recipe:', text);
    
    // Extract JSON from the response using multiple patterns
    let cleanJson = '';
    
    // Try to match JSON in markdown code block format (```json ... ```)
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/);
    if (codeBlockMatch) {
      cleanJson = codeBlockMatch[1].trim();
    } 
    // Try to extract JSON with surrounding non-code text
    else {
      // Look for a JSON-like structure - find the first { and the last }
      const openBraceIndex = text.indexOf('{');
      const closeBraceIndex = text.lastIndexOf('}');
      
      if (openBraceIndex !== -1 && closeBraceIndex !== -1 && openBraceIndex < closeBraceIndex) {
        cleanJson = text.substring(openBraceIndex, closeBraceIndex + 1).trim();
      } else {
        console.error('No JSON structure found in the audio response, attempting fallback extraction');
      }
    }
    
    // Validate JSON with a quick test parse before proceeding
    try {
      if (cleanJson) {
        JSON.parse(cleanJson);
        console.log('Valid JSON extracted from audio response');
      } else {
        throw new Error('No JSON structure extracted from audio');
      }
    } catch (error) {
      console.error('Extracted JSON from audio is invalid or not found');
      console.error('Attempting alternate extraction methods...');
      
      // Try more aggressive pattern matching
      const possibleJsonPattern = /\{\s*"title"\s*:.+\}/s;
      const possibleMatch = text.match(possibleJsonPattern);
      
      if (possibleMatch) {
        cleanJson = possibleMatch[0];
        // Validate this extracted JSON
        try {
          JSON.parse(cleanJson);
          console.log('Valid JSON extracted from audio using fallback method');
        } catch (innerError) {
          console.error('Fallback JSON extraction also failed, will use regex fallback');
          cleanJson = text; // Use the full text for regex fallback
        }
      } else {
        cleanJson = text; // Use the full text for regex fallback
      }
    }
    
    try {
      const parsedRecipe = JSON.parse(cleanJson);
      return {
        ...parsedRecipe,
        aiResponse: text
      };
    } catch (jsonError) {
      console.error('Failed to parse JSON from audio response:', jsonError);
      
      // Try to extract recipe information using regex as a fallback
      const titleMatch = text.match(/title["\s:]+([^",}\n]+)/i);
      const title = titleMatch ? titleMatch[1].trim() : "Untitled Recipe";
      
      // Extract ingredients
      const ingredientsMatch = text.match(/ingredients["\s:]+\[([\s\S]*?)\]/i);
      const ingredientsText = ingredientsMatch ? ingredientsMatch[1] : "";
      const ingredients = extractIngredientsFromText(ingredientsText);
      
      // Extract procedure
      const procedureMatch = text.match(/procedure["\s:]+\[([\s\S]*?)\]/i);
      const procedureText = procedureMatch ? procedureMatch[1] : "";
      const procedure = extractProcedureFromText(procedureText);
      
      return {
        title,
        ingredients,
        procedure,
        aiResponse: text
      };
    }
  } catch (error) {
    console.error('Error processing audio recipe:', error);
    throw new Error('Failed to process audio recipe. Please try again.');
  }
}

// Categorize grocery items based on recipes
export async function categorizeGroceryItems(
  ingredients: string[], 
  recipeDetails: { title: string; cuisine?: string }[]
): Promise<{ ingredient: string; category: string }[]> {
  try {
    const prompt = `
You are a professional chef organizing a grocery list. Categorize these ingredients into appropriate culinary categories.

The recipes I'm planning to make include:
${recipeDetails.map(r => `- ${r.title}${r.cuisine ? ` (${r.cuisine} cuisine)` : ''}`).join('\n')}

Ingredients to categorize:
${ingredients.join('\n')}

CRITICAL FORMATTING INSTRUCTIONS:
1. Return ONLY a raw JSON array without any markdown formatting
2. Do not include any explanation text before or after the JSON
3. Ensure the JSON is properly formatted with correct quotes, commas, and brackets
4. Each object in the array MUST have these exact fields:
   - "ingredient": The exact ingredient name from my list (copy exactly, preserve casing)
   - "category": One of the category names listed below (copy exactly, preserve casing)

Return a JSON array where each object has:
1. "ingredient": The exact ingredient name from my list
2. "category": One of these categories that best matches the ingredient:
   - Produce (fresh fruits and vegetables)
   - Proteins (meat, poultry, seafood, tofu, tempeh)
   - Dairy (milk, cheese, yogurt, butter)
   - Bakery (bread, pastries, baked goods)
   - Grains (rice, pasta, quinoa, oats)
   - Canned/Jarred Goods (canned beans, sauces, preserves)
   - Spices & Herbs
   - Oils & Vinegars
   - Condiments & Sauces
   - Baking Supplies
   - Snacks
   - Frozen Foods
   - Beverages
   - Ethnic Foods (ingredients specific to particular cuisines)
   - Other

The category should be relevant to how these items are organized in a grocery store and consider the cuisines of the recipes.`;

    console.log('Categorizing grocery items with prompt:', prompt);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Raw Vertex AI categorization response:', text);

    // Extract JSON from the response using multiple patterns
    let cleanJson = '';
    
    // Try to match JSON in markdown code block format (```json ... ```)
    const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/);
    if (codeBlockMatch) {
      cleanJson = codeBlockMatch[1].trim();
    } 
    // Try to extract JSON with surrounding non-code text
    else {
      // Look for a JSON array-like structure - find the first [ and the last ]
      const openBracketIndex = text.indexOf('[');
      const closeBracketIndex = text.lastIndexOf(']');
      
      if (openBracketIndex !== -1 && closeBracketIndex !== -1 && openBracketIndex < closeBracketIndex) {
        cleanJson = text.substring(openBracketIndex, closeBracketIndex + 1).trim();
      } else {
        console.error('No JSON array structure found in the categorization response, attempting fallback');
      }
    }
    
    // Validate JSON with a quick test parse before proceeding
    try {
      if (cleanJson) {
        JSON.parse(cleanJson);
        console.log('Valid JSON array extracted for grocery categories');
      } else {
        throw new Error('No JSON structure extracted for categories');
      }
    } catch (error) {
      console.error('Extracted JSON for categories is invalid or not found');
      console.error('Attempting alternate extraction methods...');
      
      // For grocery categorization, we'll attempt a more aggressive JSON extraction
      // Find anything that looks like a JSON array with ingredient/category pairs
      const possibleJsonPattern = /\[\s*\{\s*"ingredient"\s*:.+\}\s*\]/s;
      const possibleMatch = text.match(possibleJsonPattern);
      
      if (possibleMatch) {
        cleanJson = possibleMatch[0];
        // Validate the more aggressively extracted JSON
        try {
          JSON.parse(cleanJson);
          console.log('Valid JSON array extracted using fallback method');
        } catch (innerError) {
          console.error('Fallback JSON extraction also failed');
          // If all extraction attempts fail, return uncategorized
          return ingredients.map(ingredient => ({
            ingredient,
            category: 'Other'
          }));
        }
      } else {
        // If no JSON structure can be found, use fallback
        console.error('No valid JSON structure found for categories');
        return ingredients.map(ingredient => ({
          ingredient,
          category: 'Other'
        }));
      }
    }
    
    console.log('Cleaned JSON for grocery categories:', cleanJson);

    try {
      return JSON.parse(cleanJson);
    } catch (jsonError) {
      console.error('Failed to parse cleaned JSON from categorization response:', jsonError);
      
      // Fallback to basic categories if all attempts fail
      return ingredients.map(ingredient => ({
        ingredient,
        category: 'Other'
      }));
    }
  } catch (error) {
    console.error('Error categorizing grocery items:', error);
    
    // Fallback to basic categories if API fails
    return ingredients.map(ingredient => ({
      ingredient,
      category: 'Other'
    }));
  }
}

// Helper function to extract ingredients from text
function extractIngredientsFromText(text: string): { name: string; quantity: string }[] {
  const ingredients: { name: string; quantity: string }[] = [];
  
  // Try to find ingredient objects
  const ingredientMatches = text.matchAll(/\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"quantity"\s*:\s*"([^"]+)"\s*\}/g);
  
  for (const match of ingredientMatches) {
    ingredients.push({
      name: match[1].trim(),
      quantity: match[2].trim()
    });
  }
  
  // If no structured ingredients found, try to extract from bullet points or lines
  if (ingredients.length === 0) {
    const lines = text.split(/[\n,]/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.includes('"name"') && !trimmedLine.includes('"quantity"')) {
        // Try to split by common quantity patterns
        const quantityMatch = trimmedLine.match(/^([0-9./\s]+(?:cup|tbsp|tsp|oz|pound|lb|g|ml|piece|slice|medium|large|small|to taste|pinch|dash))/i);
        
        if (quantityMatch) {
          const quantity = quantityMatch[1].trim();
          const name = trimmedLine.substring(quantityMatch[0].length).trim();
          if (name) {
            ingredients.push({ name, quantity });
          }
        } else {
          // If no quantity pattern found, use the whole line as name
          ingredients.push({ name: trimmedLine, quantity: "to taste" });
        }
      }
    }
  }
  
  return ingredients;
}

// Helper function to extract procedure steps from text
function extractProcedureFromText(text: string): string[] {
  const procedure: string[] = [];
  
  // Try to find procedure steps
  const stepMatches = text.matchAll(/"Step \d+:\s*([^"]+)"/g);
  
  for (const match of stepMatches) {
    procedure.push(match[1].trim());
  }
  
  // If no structured steps found, try to extract from numbered or bulleted lists
  if (procedure.length === 0) {
    const lines = text.split(/[\n,]/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.includes('"Step')) {
        // Check if line starts with a number or bullet
        if (/^\d+\.|\*|\-/.test(trimmedLine)) {
          procedure.push(trimmedLine.replace(/^\d+\.|\*|\-/, '').trim());
        }
      }
    }
  }
  
  return procedure;
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
} 