import { GoogleGenAI } from "@google/genai";

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

export async function parseRecipe(input: string): Promise<{
  title: string;
  ingredients: { name: string; quantity: string }[];
  procedure: string[];
  aiResponse?: string;
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
    return {
      ...parsedRecipe,
      aiResponse: text
    };
  } catch (error) {
    console.error('\n=== Error Processing Recipe ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error('Failed to process recipe. Please try again.');
  }
}