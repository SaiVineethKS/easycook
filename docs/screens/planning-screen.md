# Planning Screen

The Planning Screen allows users to organize meals for specific dates, creating a comprehensive meal planning calendar. It serves as the bridge between recipe collection and grocery list generation.

## Features

1. **Calendar View**
   - Date selection for meal planning
   - Visual display of planned meals by date
   - Weekly and monthly views

2. **Meal Assignment**
   - Assign recipes to breakfast, lunch, or dinner slots
   - Multiple meals per time slot
   - Servings configuration per meal
   - Drag-and-drop recipe selection

3. **Recipe Integration**
   - Quick recipe selection from user's cookbook
   - Recipe preview with ingredients and procedure
   - Filtering options for recipe selection

4. **Plan Management**
   - Edit existing meal plans
   - Remove planned meals
   - Copy meal plans to other dates

## Implementation

### State Management

The Planning Screen uses the following state variables:

- `mealPlans`: Collection of all user meal plans
- `selectedDate`: Currently selected date for planning
- `recipes`: Available recipes from cookbook
- `expandedSections`: List of expanded UI sections
- `draggedRecipe`: Currently dragged recipe for assignment

### Calendar Logic

The calendar functionality implements:

1. Date selection with UI highlighting
2. Week-based navigation
3. Visual indicators for days with planned meals
4. Modal for detailed day view with meal slots

### Meal Plan Structure

```typescript
interface MealPlan {
  date: string;  // ISO date string format
  meals: {
    id?: string;
    type: 'breakfast' | 'lunch' | 'dinner';
    recipeId: string;
    servings?: number;
  }[];
}
```

### Persistence Model

Meal plans are:
1. Stored in Zustand global state
2. Persisted to Firebase in user's collection
3. Synced across devices

## UI Components

### Date Selection Component
```jsx
<Calendar
  value={selectedDate}
  onChange={handleDateChange}
  renderDay={(date) => {
    const hasPlannedMeals = mealPlans.some(plan => isSameDay(date, new Date(plan.date)));
    return (
      <div className={hasPlannedMeals ? 'date-with-meals' : ''}>
        {date.getDate()}
      </div>
    );
  }}
/>
```

### Meal Slot Component
```jsx
<Paper shadow="sm" p="md">
  <Group position="apart">
    <Title order={4}>{mealType.toUpperCase()}</Title>
    <Button size="sm" onClick={() => openRecipeSelection(mealType)}>
      Add Recipe
    </Button>
  </Group>
  
  {/* Assigned recipes */}
  <Stack mt="md">
    {assignedMeals.map(meal => (
      <Card key={meal.id}>
        <Group position="apart">
          <Text>{getRecipeName(meal.recipeId)}</Text>
          <NumberInput
            label="Servings"
            value={meal.servings}
            onChange={(value) => updateServings(meal.id, value)}
            min={1}
            max={20}
          />
        </Group>
        <Button variant="subtle" color="red" onClick={() => removeMeal(meal.id)}>
          Remove
        </Button>
      </Card>
    ))}
  </Stack>
</Paper>
```

### Recipe Selection Modal
```jsx
<Modal
  opened={isSelectionModalOpen}
  onClose={closeSelectionModal}
  title="Select Recipe"
>
  <TextInput
    placeholder="Search recipes..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    mb="md"
  />
  
  <Stack>
    {filteredRecipes.map(recipe => (
      <Card
        key={recipe.id}
        onClick={() => assignRecipe(recipe.id)}
        style={{ cursor: 'pointer' }}
      >
        <Text>{recipe.title}</Text>
        {recipe.tags && (
          <Group mt="xs">
            {recipe.tags.map(tag => (
              <Badge key={tag} variant="tag">{tag}</Badge>
            ))}
          </Group>
        )}
      </Card>
    ))}
  </Stack>
</Modal>
```

## Services Used

1. **RecipeService**: For fetching recipes from Firebase
2. **MealPlanService**: For CRUD operations on meal plans (via Zustand store)

## Data Flow

1. User selects a date on the calendar
2. System displays existing meal plans for that date
3. User can add recipes to breakfast, lunch, or dinner slots
4. User configures servings per meal
5. Changes are saved to store and Firebase
6. Updated plan appears on calendar

## Special Considerations

1. **Performance Optimization**
   - Lazy loading of recipes
   - Calendar rendering optimization
   - Caching of meal plans

2. **User Experience**
   - Intuitive drag-and-drop interface
   - Clear visual feedback for meal plan status
   - Responsive calendar for different screen sizes

3. **Data Integrity**
   - Handling deleted recipes in meal plans
   - Date normalization across timezones
   - Validation for meal plan data