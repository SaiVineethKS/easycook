import { create } from 'zustand';
import { Recipe } from '../types/Recipe';
import { RecipeService } from '../services/RecipeService';
import { auth } from '../config/firebase';

interface MealPlan {
  date: string;
  meals: {
    id?: string;
    type: 'breakfast' | 'lunch' | 'dinner';
    recipeId: string;
    servings?: number;
  }[];
}

// Define screen-specific UI state interfaces
interface CookbookScreenState {
  recipeInput: string;
  selectedTags: string[];
  servings: number;
  numberOfMeals: number;
  expandedRecipes: string[];
  scrollPosition: number;
}

interface PlanningScreenState {
  selectedDate: string;
  expandedSections: string[];
  scrollPosition: number;
}

interface GroceryListScreenState {
  expandedCategories: string[];
  scrollPosition: number;
}

interface ExecutionScreenState {
  currentStep: number;
  expandedSections: string[];
  scrollPosition: number;
}

interface ScreenStates {
  cookbook: CookbookScreenState;
  planning: PlanningScreenState;
  groceryList: GroceryListScreenState;
  execution: ExecutionScreenState;
}

interface AppState {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  loading: boolean;
  error: string | null;
  recipeProcessing: boolean;
  tempRecipeInput: string;
  analysisResult: Recipe | null;
  // Background processing state
  backgroundProcessingStartTime: number | null;
  // Screen state persistence
  screenStates: ScreenStates;
  saveScreenState: (screen: keyof ScreenStates, state: Partial<any>) => void;
  getScreenState: <T extends keyof ScreenStates>(screen: T) => ScreenStates[T];
  // Recipe operations
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  startRecipeProcessing: (recipeInput: string) => void;
  setRecipeProcessingComplete: (result: Recipe | null, error?: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  recipes: [],
  mealPlans: [],
  loading: false,
  error: null,
  recipeProcessing: false,
  tempRecipeInput: '',
  analysisResult: null,
  backgroundProcessingStartTime: null,
  
  // Default screen states
  screenStates: {
    cookbook: {
      recipeInput: '',
      selectedTags: [],
      servings: 4,
      numberOfMeals: 1,
      expandedRecipes: [],
      scrollPosition: 0
    },
    planning: {
      selectedDate: new Date().toISOString().split('T')[0],
      expandedSections: [],
      scrollPosition: 0
    },
    groceryList: {
      expandedCategories: [],
      scrollPosition: 0
    },
    execution: {
      currentStep: 0,
      expandedSections: [],
      scrollPosition: 0
    }
  },
  
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
  
  setRecipes: (recipes) => set({ recipes }),
  
  fetchRecipes: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const recipes = await RecipeService.getUserRecipes(userId);
      set({ recipes, loading: false });
    } catch (error) {
      set({ recipes: [], error: null, loading: false });
    }
  },
  
  addRecipe: async (recipe) => {
    try {
      // Clean up recipe data before sending to Firebase
      if (!recipe.id) recipe.id = Date.now().toString();
      const userId = recipe.userId || (auth?.currentUser?.uid || 'anonymous');
      
      // Pre-process metadata to ensure it's Firebase-friendly
      if (recipe.metadata) {
        // Remove any undefined values from metadata
        recipe.metadata = Object.fromEntries(
          Object.entries(recipe.metadata)
            .filter(([_, value]) => value !== undefined)
        );
      }
      
      console.log('Sending recipe to Firebase service:', JSON.stringify(recipe, null, 2));
      const newRecipe = await RecipeService.addRecipe(userId, recipe);
      console.log('Successfully saved recipe to Firebase:', newRecipe.id);
      
      set((state) => ({ recipes: [...state.recipes, newRecipe] }));
      return newRecipe;
    } catch (error) {
      console.error('Error adding recipe:', error);
      
      // Show helpful error message in console
      if (error instanceof Error) {
        console.warn('Error details:', error.message);
      }
      
      // Still add to local state even if Firebase fails
      set((state) => ({ recipes: [...state.recipes, recipe] }));
      return recipe;
    }
  },
  
  deleteRecipe: async (id, userId = auth?.currentUser?.uid) => {
    if (!userId) {
      console.error('No user ID available for deleting recipe');
      return;
    }
    
    try {
      await RecipeService.deleteRecipe(id, userId);
      set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) }));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      // Still remove from local state even if Firebase fails
      set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) }));
    }
  },
  
  getRecipeById: (id) => {
    return get().recipes.find(recipe => recipe.id === id);
  },
  
  getMealPlanByDate: (date) => {
    return get().mealPlans.find(plan => plan.date === date);
  },
  
  addMealPlan: (mealPlan) => {
    set((state) => {
      // Check if a meal plan for this date already exists
      const existingPlanIndex = state.mealPlans.findIndex(plan => plan.date === mealPlan.date);
      
      if (existingPlanIndex >= 0) {
        // Update existing meal plan
        const updatedMealPlans = [...state.mealPlans];
        updatedMealPlans[existingPlanIndex] = mealPlan;
        return { mealPlans: updatedMealPlans };
      } else {
        // Add new meal plan
        return { mealPlans: [...state.mealPlans, mealPlan] };
      }
    });
  },
  
  startRecipeProcessing: (recipeInput) => {
    set({ 
      recipeProcessing: true, 
      tempRecipeInput: recipeInput,
      error: null,
      backgroundProcessingStartTime: Date.now()
    });
    console.log(`Started background processing at ${new Date().toLocaleTimeString()}`);
  },
  
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
  
  toggleFavorite: async (id) => {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      console.error('No user ID available for toggling favorite');
      return;
    }
    
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
      console.error('Error toggling favorite status:', error);
      // Revert local state on error
      set((state) => ({
        recipes: state.recipes.map(r => r.id === id ? { ...r, isFavorite: !newFavoriteStatus } : r)
      }));
    }
  }
}));