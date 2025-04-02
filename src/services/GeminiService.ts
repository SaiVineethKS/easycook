import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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
      "timestamp": "00:00",
      "url": "https://youtube.com/watch?v=VIDEO_ID&t=0s"
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
7. For YouTube videos, include timestamps for each step with the correct URL format`;

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
  timestamps?: { step: number; timestamp: string; url: string }[];
}> {
  try {
    console.log('\n=== Starting Recipe Processing ===');
    console.log('Input:', input);

    const isYouTubeUrl = input.includes('youtube.com') || input.includes('youtu.be');
    const userPrompt = isYouTubeUrl 
      ? 'Extract recipe from this video and include timestamps for each step'
      : `Parse recipe from this description: ${input}`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
    console.log('\n=== Full Prompt ===');
    console.log(fullPrompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          text: fullPrompt
        },
        ...(isYouTubeUrl ? [{
          fileData: {
            fileUri: input
          }
        }] : [])
      ]
    });

    if (!response.text) {
      throw new Error('No response text received from Gemini API');
    }

    const text = response.text;
    console.log('\n=== Raw Gemini Response ===');
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
        throw new Error('No JSON structure found in the response');
      }
    }
    
    // Validate JSON with a quick test parse before proceeding
    try {
      JSON.parse(cleanJson);
    } catch (error) {
      console.error('Extracted JSON is invalid:', cleanJson);
      throw new Error('Extracted content is not valid JSON');
    }
    console.log('\n=== Cleaned JSON ===');
    console.log(cleanJson);

    try {
      const parsedRecipe = JSON.parse(cleanJson);
      const suggestedTags = suggestTags(parsedRecipe);

      return {
        ...parsedRecipe,
        aiResponse: text,
        suggestedTags,
        timestamps: parsedRecipe.timestamps || []
      };
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Failed to parse recipe JSON. Please try again.');
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

    // Upload the audio file
    const uploadedFile = await ai.files.upload({
      file: audioFile,
      config: { mimeType: audioFile.type }
    });

    // Generate content from the audio
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        `${SYSTEM_PROMPT}\n\nListen to this audio recording and extract the recipe details. Format the response as a JSON object according to the structure above.`
      ])
    });

    if (!result.text) {
      throw new Error('No response received from Gemini API');
    }
    
    const text = result.text;
    console.log('Raw audio response:', text);

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
        throw new Error('No JSON structure found in the audio response');
      }
    }
    
    // Validate JSON with a quick test parse before proceeding
    try {
      JSON.parse(cleanJson);
    } catch (error) {
      console.error('Extracted JSON from audio is invalid:', cleanJson);
      throw new Error('Extracted content from audio is not valid JSON');
    }
    
    console.log('Parsed recipe from audio:', cleanJson);
    
    const parsedRecipe = JSON.parse(cleanJson);
    return {
      ...parsedRecipe,
      aiResponse: result.text
    };
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

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ text: prompt }]
    });

    if (!response.text) {
      throw new Error('No response text received from Gemini API');
    }

    const text = response.text;
    console.log('Raw Gemini categorization response:', text);

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
        // Use the entire text as a fallback
        cleanJson = text.trim();
      }
    }
    
    // Validate JSON with a quick test parse before proceeding
    try {
      JSON.parse(cleanJson);
    } catch (error) {
      console.error('Extracted JSON for categories is invalid, attempting fallback');
      // For grocery categorization, we'll attempt a more aggressive JSON extraction
      // Find anything that looks like a JSON array
      const possibleJsonPattern = /\[\s*\{\s*"ingredient"\s*:.+\}\s*\]/s;
      const possibleMatch = text.match(possibleJsonPattern);
      
      if (possibleMatch) {
        cleanJson = possibleMatch[0];
        // Validate the more aggressively extracted JSON
        try {
          JSON.parse(cleanJson);
        } catch (innerError) {
          console.error('Fallback JSON extraction also failed');
          throw new Error('Failed to extract valid JSON for categories');
        }
      } else {
        // If all extraction attempts fail, return uncategorized
        console.error('No valid JSON for categories found, using fallback categories');
        return ingredients.map(ingredient => ({
          ingredient,
          category: 'Other'
        }));
      }
    }
    
    console.log('Cleaned JSON for grocery categories:', cleanJson);

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error categorizing grocery items:', error);
    
    // Fallback to basic categories if API fails
    return ingredients.map(ingredient => ({
      ingredient,
      category: 'Other'
    }));
  }
}