# AI Service

The AI Service acts as an abstraction layer for interactions with AI models, providing a unified interface regardless of the specific AI provider being used.

## Features

1. **Provider Abstraction**
   - Unified interface for multiple AI providers
   - Environment-based provider selection
   - Seamless switching between providers

2. **Recipe Processing**
   - Text-to-structured-recipe conversion
   - Audio-to-recipe processing
   - Ingredient extraction and normalization

3. **Grocery Categorization**
   - Ingredient-to-category mapping
   - Intelligent grocery department assignment
   - Similarity detection for ingredient consolidation

## Implementation

### Provider Selection

The service determines which AI provider to use based on environment configuration:

```typescript
const apiType = import.meta.env.VITE_AI_API_TYPE || 'gemini';
```

This allows for easy switching between providers (e.g., from Gemini to Vertex AI) without changing code.

### Method Delegation

Each method in the AI Service delegates to the appropriate provider-specific implementation:

```typescript
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
```

### Key Functions

#### `parseRecipe(input: string): Promise<Recipe>`

- Accepts: Recipe text or YouTube URL
- Process: Sends to AI model for processing
- Returns: Structured Recipe object

#### `parseRecipeFromAudio(audioFile: File): Promise<Recipe>`

- Accepts: Audio recording file
- Process: Transcribes audio and processes content
- Returns: Structured Recipe object

#### `categorizeGroceryItems(items: string[], recipes: []): Promise<CategorizedItems>`

- Accepts: List of ingredients and associated recipes
- Process: Analyzes ingredients and assigns categories
- Returns: Categorized grocery items

## Provider Interfaces

Each provider (Gemini, Vertex AI) must implement these core functions:

```typescript
interface AIProvider {
  parseRecipe(input: string): Promise<Recipe>;
  parseRecipeFromAudio(audioFile: File): Promise<Recipe>;
  categorizeGroceryItems(items: string[], recipes: []): Promise<CategorizedItems>;
}
```

## Error Handling

The service implements consistent error handling patterns:

1. Specific error types for different failure modes
2. Detailed error messages for debugging
3. Fallbacks for partial results when possible

## Integration Points

### With RecipeService
- Processed recipes are passed to RecipeService for storage
- Recipe metadata includes AI processing information

### With AudioService
- Audio recordings are processed through AIService
- Transcription and content analysis handled by AI providers

### With GroceryListScreen
- Ingredient lists are sent for categorization
- Categorized results are used for grocery list organization

## Configuration

Configuration is handled through environment variables:

```
VITE_AI_API_TYPE=gemini|vertex
VITE_GEMINI_API_KEY=your_api_key
VITE_VERTEX_PROJECT_ID=your_project_id
VITE_VERTEX_LOCATION=your_location
```

## Usage Examples

### Recipe Parsing from Text
```typescript
import { parseRecipe } from '../services/AIService';

// In a component or handler
const handleAddRecipe = async () => {
  try {
    const result = await parseRecipe(recipeText);
    // Process structured recipe
  } catch (error) {
    // Handle error
  }
};
```

### Recipe Parsing from Audio
```typescript
import { parseRecipeFromAudio } from '../services/AIService';

// In a component or handler
const handleAudioProcessing = async (audioFile) => {
  try {
    const result = await parseRecipeFromAudio(audioFile);
    // Process structured recipe
  } catch (error) {
    // Handle error
  }
};
```

### Grocery Item Categorization
```typescript
import { categorizeGroceryItems } from '../services/AIService';

// In the grocery list generation
const generateCategorizedList = async (items, recipes) => {
  try {
    const categorizedItems = await categorizeGroceryItems(items, recipes);
    // Organize by category
  } catch (error) {
    // Handle error
  }
};
```

## Extension Points

The AI Service is designed for extensibility:

1. New AI providers can be added by implementing the core interface
2. Additional AI functions can be added to the service
3. Model-specific optimizations can be implemented in provider services