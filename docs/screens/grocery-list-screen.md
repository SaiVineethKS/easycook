# Grocery List Screen

The Grocery List Screen automatically generates shopping lists from planned meals, organizing ingredients by category for easier shopping.

## Features

1. **Automated List Generation**
   - Creates lists from planned meals
   - Consolidates duplicate ingredients
   - Calculates quantities based on servings

2. **Date Range Selection**
   - Choose specific timeframes for grocery lists
   - Default current week view
   - Custom date range options

3. **Categorization**
   - AI-powered ingredient categorization
   - Grocery department organization
   - Visual separators between categories

4. **Interactive Elements**
   - Checkbox functionality for shopping
   - Expandable/collapsible categories
   - Print-friendly layout

5. **Meal Selection**
   - Include/exclude specific meals
   - Meal type filtering
   - Recipe-based filtering

## Implementation

### State Management

The Grocery List Screen uses the following state variables:

- `dateRange`: Selected start and end dates for the grocery list
- `includedMeals`: Meals to include in the list
- `groceryList`: Processed list of ingredients with categories
- `expandedCategories`: UI state for category expansion
- `categorizing`: Loading state during AI categorization
- `checkedItems`: Tracking of checked-off items

### Grocery Item Structure

```typescript
interface GroceryItem {
  ingredient: string;
  quantity: string;
  recipes: string[];  // Recipe titles using this ingredient
  category: string;   // Department/category
  checked: boolean;   // Shopping progress
}
```

### AI Categorization

The screen uses AI to:
1. Extract ingredients from multiple recipes
2. Combine similar ingredients with different names
3. Assign grocery store categories
4. Calculate combined quantities

## UI Components

### Date Range Selector Component
```jsx
<Group>
  <DatePicker
    label="Start Date"
    value={dateRange.start ? new Date(dateRange.start) : null}
    onChange={(date) => setDateRange({...dateRange, start: date?.toISOString().split('T')[0] || null})}
  />
  <DatePicker
    label="End Date"
    value={dateRange.end ? new Date(dateRange.end) : null}
    onChange={(date) => setDateRange({...dateRange, end: date?.toISOString().split('T')[0] || null})}
  />
  <Button onClick={generateGroceryList}>
    Generate List
  </Button>
</Group>
```

### Meal Selection Component
```jsx
<Paper p="md" withBorder>
  <Title order={3} mb="md">Selected Meals</Title>
  
  <Group>
    <Button onClick={selectAllMeals}>Select All</Button>
    <Button onClick={deselectAllMeals}>Deselect All</Button>
  </Group>
  
  <Grid mt="md">
    {availableMeals.map(meal => (
      <Grid.Col span={4} key={`${meal.date}-${meal.type}-${meal.recipeId}`}>
        <Paper
          shadow="sm"
          p="md"
          withBorder
          style={{ 
            opacity: includedMeals.includes(meal) ? 1 : 0.5,
            cursor: 'pointer'
          }}
          onClick={() => toggleMealSelection(meal)}
        >
          <Stack>
            <Badge size="lg" color={getMealBadgeColor(meal.type)}>
              {meal.type}
            </Badge>
            <Title order={3}>{meal.recipe}</Title>
            <Text c="#5b4f3f" fw={500}>
              {formatDate(meal.date)}
            </Text>
          </Stack>
        </Paper>
      </Grid.Col>
    ))}
  </Grid>
</Paper>
```

### Grocery List Component
```jsx
<div id="grocery-list-printable">
  <Stack>
    {/* Categorized sections */}
    {categories.map(category => (
      <Box key={category}>
        <Text fw={700} size="lg" mb="xs" tt="capitalize">
          {formatCategoryName(category)}
        </Text>
        
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th style={{ width: '5%' }}></th>
              <th style={{ width: '55%' }}>Ingredient</th>
              <th style={{ width: '20%' }}>Quantity</th>
              <th style={{ width: '20%' }}>Used In</th>
            </tr>
          </thead>
          <tbody>
            {itemsByCategory[category].map(item => (
              <tr key={`${item.ingredient}-${item.category}`}>
                <td>
                  <Checkbox
                    checked={item.checked}
                    onChange={() => toggleItemChecked(item)}
                  />
                </td>
                <td style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                  {item.ingredient}
                </td>
                <td>{item.quantity}</td>
                <td>{item.recipes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    ))}
  </Stack>
</div>
```

## Services Used

1. **AIService**: For ingredient categorization
2. **RecipeService**: For fetching recipe details
3. **PrintService**: For print-friendly formatting

## Data Flow

1. User selects a date range and meals to include
2. System extracts all ingredients from selected recipes
3. AI service categorizes ingredients by grocery department
4. Similar ingredients are combined with quantity calculation
5. Categorized list is displayed with interactive checkboxes
6. User can check off items while shopping

## Special Considerations

1. **Performance Optimization**
   - Optimized meal loading for large date ranges
   - Efficient ingredient processing for multiple recipes
   - Background AI processing for categorization

2. **User Experience**
   - Clear category organization for faster shopping
   - Print-friendly layout with proper page breaks
   - Mobile-optimized view for in-store use

3. **Technical Challenges**
   - Ingredient parsing and normalization
   - Quantity unit conversion and combination
   - Handling different recipe formats