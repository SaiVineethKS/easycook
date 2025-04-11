import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Recipe } from '../types/Recipe';

export const RecipeService = {
  // Add a new recipe
  async addRecipe(userId: string, recipe: Omit<Recipe, 'id'>) {
    try {
      // Process metadata to remove any undefined values
      let processedMetadata = null;
      if (recipe.metadata) {
        processedMetadata = Object.fromEntries(
          Object.entries(recipe.metadata)
            .filter(([_, value]) => value !== undefined)
        );
      }
      
      // Clean up the recipe object by removing undefined values
      const cleanRecipe = Object.fromEntries(
        Object.entries({
          ...recipe,
          userId,
          createdAt: new Date().toISOString(),
          aiResponse: recipe.aiResponse || null, // Convert undefined to null
          tags: recipe.tags || [],
          url: recipe.url || null,
          thumbnailUrl: recipe.thumbnailUrl || null,
          isFavorite: recipe.isFavorite || false,
          metadata: processedMetadata
        }).filter(([_, value]) => value !== undefined)
      );

      const docRef = await addDoc(collection(db, 'recipes'), cleanRecipe);
      return { ...cleanRecipe, id: docRef.id };
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw new Error('Failed to add recipe. Please try again.');
    }
  },

  // Get all recipes for a user
  async getUserRecipes(userId: string) {
    if (!userId) {
      console.error('No userId provided to getUserRecipes');
      return [];
    }

    try {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return [];
      }

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          ingredients: data.ingredients || [],
          procedure: data.procedure || [],
          userId: data.userId,
          createdAt: data.createdAt || new Date().toISOString(),
          aiResponse: data.aiResponse || null,
          tags: data.tags || [],
          url: data.url || null,
          isFavorite: data.isFavorite || false,
          servings: data.servings || 1,
          numberOfMeals: data.numberOfMeals || 1,
          metadata: data.metadata || {
            source: 'text',
            processingDate: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error('Error getting recipes:', error);
      return [];
    }
  },

  // Delete a recipe
  async deleteRecipe(recipeId: string, userId: string) {
    try {
      // Verify ownership before deleting
      const docRef = doc(db, 'recipes', recipeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw new Error('Failed to delete recipe. Please try again.');
    }
  },

  // Update a recipe
  async updateRecipe(recipeId: string, userId: string, updates: Partial<Recipe>) {
    try {
      // Verify ownership before updating
      const docRef = doc(db, 'recipes', recipeId);
      await updateDoc(docRef, { ...updates, userId });
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw new Error('Failed to update recipe. Please try again.');
    }
  }
}; 