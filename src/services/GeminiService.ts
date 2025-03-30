import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Base system prompt without URL-specific instructions
const SYSTEM_PROMPT = `You are a professional chef and recipe expert. Create a detailed recipe in JSON format.

Return ONLY a valid JSON object with this structure:
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
  ]
}

Important:
- Never return "Not specified" or empty values
- If exact quantities aren't given, provide reasonable estimates
- Include all necessary cooking steps with timing and temperature details`;

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

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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

    const cleanJson = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('\n=== Cleaned JSON ===');
    console.log(cleanJson);

    const parsedRecipe = JSON.parse(cleanJson);
    const suggestedTags = suggestTags(parsedRecipe);

    return {
      ...parsedRecipe,
      aiResponse: text,
      suggestedTags
    };
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
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        `${SYSTEM_PROMPT}\n\nListen to this audio recording and extract the recipe details. Format the response as a JSON object according to the structure above.`
      ])
    });

    if (!result.text) {
      throw new Error('No response received from Gemini API');
    }

    const cleanJson = result.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Parsed recipe:', cleanJson);
    
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