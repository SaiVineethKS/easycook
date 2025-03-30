import { create } from 'zustand';
import { Recipe } from '../types/Recipe';

interface MealPlan {
  date: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner';
    recipeId: string;
  }[];
}

interface AppState {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  addRecipe: (recipe: Recipe) => void;
  addMealPlan: (mealPlan: MealPlan) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getMealPlanByDate: (date: string) => MealPlan | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  recipes: [],
  mealPlans: [],
  
  addRecipe: (recipe) => {
    set((state) => ({
      recipes: [...state.recipes, recipe]
    }));
  },
  
  addMealPlan: (mealPlan) => {
    set((state) => ({
      mealPlans: [...state.mealPlans, mealPlan]
    }));
  },
  
  getRecipeById: (id) => {
    return get().recipes.find(recipe => recipe.id === id);
  },
  
  getMealPlanByDate: (date) => {
    return get().mealPlans.find(plan => plan.date === date);
  }
}));