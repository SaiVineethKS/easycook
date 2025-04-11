import { parseRecipe as parseRecipeGemini, parseRecipeFromAudio as parseRecipeFromAudioGemini, categorizeGroceryItems as categorizeGroceryItemsGemini } from './GeminiService';
import { parseRecipe as parseRecipeVertex, parseRecipeFromAudio as parseRecipeFromAudioVertex, categorizeGroceryItems as categorizeGroceryItemsVertex } from './VertexAIService';

// Get the API type from environment variables
const apiType = import.meta.env.VITE_AI_API_TYPE || 'gemini';
console.log('Using AI API:', apiType);

// Export the appropriate functions based on the API type
export const parseRecipe = async (input: string) => {
  return apiType === 'gemini' 
    ? parseRecipeGemini(input)
    : parseRecipeVertex(input);
};

export const parseRecipeFromAudio = async (audioFile: File) => {
  return apiType === 'gemini'
    ? parseRecipeFromAudioGemini(audioFile)
    : parseRecipeFromAudioVertex(audioFile);
};

export const categorizeGroceryItems = async (items: string[], recipes: { title: string; id: string; }[]) => {
  return apiType === 'gemini'
    ? categorizeGroceryItemsGemini(items, recipes)
    : categorizeGroceryItemsVertex(items, recipes);
}; 