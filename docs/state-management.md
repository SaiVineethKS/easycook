# State Management

EasyCook uses Zustand for global state management, providing a simple yet powerful approach to handling application state.

## Overview

Zustand was chosen for EasyCook because it offers:

1. Minimalistic API with low boilerplate
2. React hooks-based approach
3. TypeScript support for type safety
4. Efficient re-renders with fine-grained subscriptions
5. Middleware support for advanced patterns

## Store Structure

The main store is defined in `src/store/useStore.ts` and handles several key aspects of application state:

### Recipe Management

```typescript
interface AppState {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  // ...
}
```

### Recipe Processing State

```typescript
interface AppState {
  // ...
  recipeProcessing: boolean;
  tempRecipeInput: string;
  analysisResult: Recipe | null;
  backgroundProcessingStartTime: number | null;
  startRecipeProcessing: (recipeInput: string) => void;
  setRecipeProcessingComplete: (result: Recipe | null, error?: string | null) => void;
  // ...
}
```

### Screen-Specific UI State

```typescript
interface ScreenStates {
  cookbook: CookbookScreenState;
  planning: PlanningScreenState;
  groceryList: GroceryListScreenState;
  execution: ExecutionScreenState;
}

interface AppState {
  // ...
  screenStates: ScreenStates;
  saveScreenState: (screen: keyof ScreenStates, state: Partial<any>) => void;
  getScreenState: <T extends keyof ScreenStates>(screen: T) => ScreenStates[T];
  // ...
}
```

### Meal Planning

```typescript
interface AppState {
  // ...
  mealPlans: MealPlan[];
  addMealPlan: (mealPlan: MealPlan) => void;
  getMealPlanByDate: (date: string) => MealPlan | undefined;
  // ...
}
```

## Implementation

The store is created with the Zustand `create` function and implements both state and actions:

```typescript
export const useStore = create<AppState>((set, get) => ({
  // Initial state
  recipes: [],
  mealPlans: [],
  loading: false,
  error: null,
  // ...

  // Actions that modify state
  setRecipes: (recipes) => set({ recipes }),
  
  addRecipe: async (recipe) => {
    try {
      // Add to Firebase
      const newRecipe = await RecipeService.addRecipe(userId, recipe);
      // Update local state
      set((state) => ({ recipes: [...state.recipes, newRecipe] }));
      return newRecipe;
    } catch (error) {
      // Error handling
    }
  },
  
  // More actions...
}));
```

## State Persistence

The application implements UI state persistence across navigation using the screen state mechanism:

```typescript
// Save screen state
saveScreenState: (screen, state) => set(prevState => ({
  screenStates: {
    ...prevState.screenStates,
    [screen]: {
      ...prevState.screenStates[screen],
      ...state
    }
  }
})),

// Get screen state
getScreenState: (screen) => get().screenStates[screen],
```

This allows components to save their UI state when unmounting and restore it when remounting, providing a smoother user experience.

## Usage in Components

Components can access the store using the `useStore` hook with selectors for efficiency:

```typescript
// Access the entire recipes array
const recipes = useStore(state => state.recipes);

// Access a specific action
const addRecipe = useStore(state => state.addRecipe);

// Access screen-specific state
const savedState = useStore(state => state.getScreenState('cookbook'));

// Save screen-specific state
const saveScreenState = useStore(state => state.saveScreenState);
useEffect(() => {
  saveScreenState('cookbook', {
    expandedRecipes: expandedRecipes,
    scrollPosition: containerRef.current?.scrollTop
  });
}, [expandedRecipes, saveScreenState]);
```

## Background Processing Pattern

The store implements a background processing pattern for long-running operations like AI recipe parsing:

```typescript
// Start background processing
startRecipeProcessing: (recipeInput) => set({ 
  recipeProcessing: true, 
  tempRecipeInput: recipeInput,
  error: null,
  backgroundProcessingStartTime: Date.now()
}),

// Complete background processing
setRecipeProcessingComplete: (result, error = null) => {
  const startTime = get().backgroundProcessingStartTime;
  const processingTime = startTime ? ((Date.now() - startTime) / 1000).toFixed(2) : 'unknown';
  
  set({ 
    recipeProcessing: false,
    analysisResult: result,
    error,
    backgroundProcessingStartTime: null
  });
  
  console.log(`Completed background processing in ${processingTime} seconds.`);
},
```

This allows for smooth UI interactions during lengthy operations and enables cross-screen processing status tracking.

## Optimistic Updates

The store implements optimistic updates for better user experience:

```typescript
toggleFavorite: async (id) => {
  const recipe = get().recipes.find(r => r.id === id);
  if (!recipe) return;
  
  const newFavoriteStatus = !recipe.isFavorite;
  
  // Update local state immediately for responsive UI
  set((state) => ({
    recipes: state.recipes.map(r => r.id === id ? { ...r, isFavorite: newFavoriteStatus } : r)
  }));
  
  // Then persist to Firebase
  try {
    await RecipeService.updateRecipe(id, userId, { isFavorite: newFavoriteStatus });
  } catch (error) {
    // Revert local state on error
    set((state) => ({
      recipes: state.recipes.map(r => r.id === id ? { ...r, isFavorite: !newFavoriteStatus } : r)
    }));
  }
}
```

## Best Practices

When working with the store:

1. Use selectors to minimize re-renders
2. Keep state normalized when possible
3. Implement optimistic updates for responsive UI
4. Encapsulate Firebase operations within store actions
5. Use the screen state mechanism for UI persistence
6. Handle errors gracefully with state rollbacks
7. Provide detailed error information in the state