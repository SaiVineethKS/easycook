# Recipe Service

The Recipe Service manages all interactions with the Firebase database for recipe storage, retrieval, and manipulation, providing a clean interface for recipe-related operations.

## Features

1. **CRUD Operations**
   - Create new recipes
   - Read recipes with filtering
   - Update existing recipes
   - Delete recipes

2. **User-Specific Storage**
   - User-segregated recipe collections
   - Authentication integration
   - Ownership verification

3. **Data Transformation**
   - Firebase data format conversion
   - Type safety with TypeScript
   - Metadata enrichment

4. **Query Support**
   - Filtering by tags
   - Sorting options
   - Favorite recipe access

## Implementation

### Firebase Integration

The service connects to Firebase Firestore for data storage:

```typescript
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
```

### Data Structure

Recipes are stored in a user-specific collection structure:

```
/users/{userId}/recipes/{recipeId}
```

This ensures data isolation between users and efficient queries.

### Key Methods

#### `getUserRecipes(userId: string): Promise<Recipe[]>`

- Fetches all recipes for a specific user
- Transforms Firestore documents to Recipe objects
- Handles errors with specific messages

#### `addRecipe(userId: string, recipe: Recipe): Promise<Recipe>`

- Adds a new recipe to the user's collection
- Generates a unique ID if not provided
- Sanitizes data for Firebase compatibility
- Returns the created recipe with ID

#### `updateRecipe(recipeId: string, userId: string, data: Partial<Recipe>): Promise<void>`

- Updates specific fields of an existing recipe
- Validates user ownership
- Supports partial updates

#### `deleteRecipe(recipeId: string, userId: string): Promise<void>`

- Removes a recipe from the database
- Verifies user authorization
- Handles cascading deletions if needed

## Data Transformation

The service handles transformation between Firebase document format and application Recipe type:

```typescript
// Convert Firestore document to Recipe
const convertToRecipe = (doc: any): Recipe => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // Handle timestamp conversion
    createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
    // Handle other special fields
  };
};

// Prepare Recipe for Firebase storage
const prepareForFirestore = (recipe: Recipe): any => {
  // Remove any undefined values to prevent Firebase errors
  return Object.fromEntries(
    Object.entries(recipe)
      .filter(([_, value]) => value !== undefined)
  );
};
```

## Error Handling

The service implements robust error handling:

1. Specific error types for different operations
2. Detailed logging for debugging
3. User-friendly error messages
4. Graceful fallbacks for offline operation

## Integration Points

### With AuthContext
- User ID from authentication is used for data access
- Authorization checks for recipe operations

### With Zustand Store
- Recipe operations update the global state
- Optimistic updates for better user experience

### With AI Service
- Processed recipes from AI are stored via RecipeService
- Recipe metadata includes AI processing information

## Usage Examples

### Fetching User Recipes
```typescript
import { RecipeService } from '../services/RecipeService';

// In a component or effect
const loadUserRecipes = async (userId) => {
  try {
    const recipes = await RecipeService.getUserRecipes(userId);
    // Process recipes
  } catch (error) {
    // Handle error
  }
};
```

### Adding a Recipe
```typescript
import { RecipeService } from '../services/RecipeService';

// In a form submission handler
const handleAddRecipe = async (recipeData, userId) => {
  try {
    const newRecipe = await RecipeService.addRecipe(userId, recipeData);
    // Update UI with new recipe
  } catch (error) {
    // Handle error
  }
};
```

### Updating a Recipe
```typescript
import { RecipeService } from '../services/RecipeService';

// In a toggle favorite handler
const toggleFavorite = async (recipeId, userId, currentStatus) => {
  try {
    await RecipeService.updateRecipe(recipeId, userId, { 
      isFavorite: !currentStatus 
    });
    // Update UI
  } catch (error) {
    // Handle error
  }
};
```

## Special Considerations

1. **Performance Optimization**
   - Batch operations for multiple updates
   - Caching strategies for frequent reads
   - Optimistic UI updates

2. **Offline Support**
   - Local storage fallbacks
   - Synchronization when reconnected
   - Conflict resolution strategies

3. **Security**
   - User-based access control
   - Data validation before storage
   - Firebase security rules enforcement