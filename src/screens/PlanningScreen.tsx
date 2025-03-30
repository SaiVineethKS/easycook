import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Button, 
  Card, 
  Group, 
  Stack, 
  Text,
  Paper,
  ScrollArea,
  Box,
  UnstyledButton,
  rem,
  Tooltip,
  ActionIcon,
  TextInput,
  Indicator,
  Badge,
  Modal,
  Loader,
  Notification
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { DatePickerInput } from '@mantine/dates';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, isToday, isSameDay, parseISO } from 'date-fns';
import { 
  IconSearch, 
  IconShoppingCart, 
  IconCoffee, 
  IconSoup, 
  IconMoon,
  IconChevronDown,
  IconInfoCircle,
  IconX
} from '@tabler/icons-react';

export const PlanningScreen = () => {
  const navigate = useNavigate();
  
  // Planning state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | null}>({
    message: '',
    type: null
  });
  const [recentlyAddedMeals, setRecentlyAddedMeals] = useState<{recipeId: string, mealType: string, timestamp: number}[]>([]);
  
  // This data is only needed for the grocery list functionality
  const [groceryDateRange, setGroceryDateRange] = useState<[Date | null, Date | null]>([new Date(), addDays(new Date(), 6)]);
  
  const { user } = useAuth();
  const { recipes, addMealPlan, getMealPlanByDate } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Format date string for meal plan lookup
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDatePlan = getMealPlanByDate(dateStr);
  
  // Meal type icons with their labels
  const mealIcons = {
    breakfast: { icon: IconCoffee, label: 'Breakfast', color: 'orange' },
    lunch: { icon: IconSoup, label: 'Lunch', color: 'blue' },
    dinner: { icon: IconMoon, label: 'Dinner', color: 'indigo' }
  };
  
  // Generate dates for 3 months before and after current date (180 days total)
  const generateDates = () => {
    const dates = [];
    for (let i = -90; i <= 90; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };
  
  const dates = generateDates();
  
  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.ingredients?.some(ing => 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  // Scroll to today's date when component mounts
  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  // Check if a specific date has any meals planned
  const hasPlannedMeals = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const plan = getMealPlanByDate(formattedDate);
    return !!plan && plan.meals.length > 0;
  };
  
  // Check if a specific date has a specific meal type planned
  const hasMealType = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const plan = getMealPlanByDate(formattedDate);
    if (!plan) return false;
    
    return plan.meals.some(meal => meal.type === mealType);
  };
  
  // Get all meals for a specific meal type on a specific date
  const getMealsForType = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const plan = getMealPlanByDate(formattedDate);
    if (!plan) return [];
    
    return plan.meals
      .filter(meal => meal.type === mealType)
      .map(meal => ({
        ...meal,
        recipe: getRecipeById(meal.recipeId)
      }));
  };
  
  // Get recipe details by ID
  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  // Get meal plan details for displaying
  const getMealPlanDetails = () => {
    if (!selectedDatePlan || !selectedDatePlan.meals.length) return [];
    
    // Sort meals by type (breakfast first, then lunch, then dinner)
    const sortedMeals = [...selectedDatePlan.meals].sort((a, b) => {
      const typeOrder = { breakfast: 0, lunch: 1, dinner: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    return sortedMeals.map(meal => {
      const recipe = getRecipeById(meal.recipeId);
      return {
        ...meal,
        recipe
      };
    });
  };

  const handleAddMeal = (recipeId: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    try {
      const existingPlan = getMealPlanByDate(dateStr);
      const recipe = getRecipeById(recipeId);
      
      // Generate a unique ID for this meal entry
      const mealId = `${recipeId}-${mealType}-${Date.now()}`;

      if (existingPlan) {
        // Just add the new meal without replacing existing ones
        const updatedMeals = [
          ...existingPlan.meals,
          { 
            id: mealId,
            type: mealType, 
            recipeId,
            servings: 2 // Default to 2 servings
          }
        ];
        
        addMealPlan({
          date: dateStr,
          meals: updatedMeals,
        });
      } else {
        addMealPlan({
          date: dateStr,
          meals: [{ 
            id: mealId,
            type: mealType, 
            recipeId,
            servings: 2 // Default to 2 servings
          }],
        });
      }
      
      // Show success feedback
      setFeedback({
        message: `Added ${recipe?.title || 'recipe'} to ${mealIcons[mealType].label.toLowerCase()}`,
        type: 'success'
      });
      
      // Track recently added meal for visual feedback
      const newRecentlyAdded = {
        recipeId,
        mealType,
        timestamp: Date.now()
      };
      
      setRecentlyAddedMeals(prev => [...prev, newRecentlyAdded]);
      
      // Remove from recently added after 2 seconds
      setTimeout(() => {
        setRecentlyAddedMeals(prev => 
          prev.filter(item => item.timestamp !== newRecentlyAdded.timestamp)
        );
      }, 2000);
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    } catch (error) {
      console.error('Error adding meal:', error);
      setFeedback({
        message: 'Failed to add meal',
        type: 'error'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    }
  };
  
  /**
   * Remove a meal from the plan by its ID
   */
  const handleRemoveMeal = (mealId: string) => {
    try {
      if (!selectedDatePlan) return;
      
      // Find the meal before removing it to use in feedback
      const mealToRemove = selectedDatePlan.meals.find(meal => meal.id === mealId);
      const recipe = mealToRemove ? getRecipeById(mealToRemove.recipeId) : null;
      const mealType = mealToRemove?.type || 'meal';
      
      // Filter out the meal with the specified ID
      const updatedMeals = selectedDatePlan.meals.filter(meal => meal.id !== mealId);
      
      // Update the meal plan
      addMealPlan({
        date: dateStr,
        meals: updatedMeals
      });
      
      // Show success feedback
      setFeedback({
        message: `Removed ${recipe?.title || 'recipe'} from ${mealIcons[mealType as 'breakfast' | 'lunch' | 'dinner'].label.toLowerCase()}`,
        type: 'success'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    } catch (error) {
      console.error('Error removing meal:', error);
      setFeedback({
        message: 'Failed to remove meal',
        type: 'error'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    }
  };
  
  /**
   * Update the number of servings for a meal
   */
  const handleUpdateServings = (mealId: string, servings: number) => {
    try {
      if (!selectedDatePlan) return;
      
      // Find and update the meal with the new servings count
      const updatedMeals = selectedDatePlan.meals.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, servings };
        }
        return meal;
      });
      
      // Update the meal plan
      addMealPlan({
        date: dateStr,
        meals: updatedMeals
      });
      
      // Show success feedback
      setFeedback({
        message: `Updated servings to ${servings}`,
        type: 'success'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    } catch (error) {
      console.error('Error updating servings:', error);
      setFeedback({
        message: 'Failed to update servings',
        type: 'error'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    }
  };
  
  /**
   * Function to parse ingredient quantities
   * Extracts number values from strings like "2 cups", "1/2 tbsp", etc.
   */
  const parseQuantity = (quantityStr: string): number => {
    // Check for fractions like 1/2, 3/4, etc.
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
    
    // Check for decimal and whole numbers
    const match = quantityStr.match(/(\d+\.?\d*)/);
    if (match && match[0]) {
      return parseFloat(match[0]);
    }
    
    // Default to 1 if no number is found
    return 1;
  };
  
  /**
   * Toggle the checked state of an item in the grocery list
   */
  const toggleItemChecked = (index: number) => {
    setGroceryList(prevList => {
      const newList = [...prevList];
      newList[index] = {
        ...newList[index],
        checked: !newList[index].checked
      };
      return newList;
    });
  };
  
  /**
   * Clear all checked items from the grocery list
   */
  const clearCheckedItems = () => {
    setGroceryList(prevList => prevList.filter(item => !item.checked));
  };
  
  /**
   * Print the grocery list
   */
  const printGroceryList = () => {
    const printContent = document.getElementById('grocery-list-printable');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };
  
  /**
   * Navigate to Grocery List screen with selected date range
   */
  const navigateToGroceryList = () => {
    if (!groceryDateRange[0] || !groceryDateRange[1]) {
      setFeedback({
        message: 'Please select a date range',
        type: 'error'
      });
      return;
    }
    
    // Store the selected date range in localStorage so it can be accessed from the Grocery List screen
    if (groceryDateRange[0] && groceryDateRange[1]) {
      localStorage.setItem('groceryDateRange', JSON.stringify({
        start: format(groceryDateRange[0], 'yyyy-MM-dd'),
        end: format(groceryDateRange[1], 'yyyy-MM-dd')
      }));
    }
    
    // Navigate to the grocery list page
    navigate('/grocery');
  };

  return (
    <Container size="lg">
      <Stack spacing="md">
        {/* Feedback notification */}
        {feedback.type && (
          <Paper 
            p="sm" 
            withBorder 
            radius="md" 
            bg={feedback.type === 'success' ? 'green.0' : 'red.0'}
            style={{
              position: 'fixed',
              bottom: rem(20),
              right: rem(20),
              zIndex: 1000,
              maxWidth: '300px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Text 
              c={feedback.type === 'success' ? 'green.7' : 'red.7'}
              fw={500}
            >
              {feedback.message}
            </Text>
          </Paper>
        )}
        
        {/* Planning header */}
        <Group position="apart">
          <Title order={2}>Meal Planning</Title>
        </Group>
        
        {/* Main meal planning content */}
        <Paper shadow="xs" p="md" withBorder>
          <Text fw={600} size="lg" mb="md">
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
          
          <ScrollArea 
            viewportRef={scrollRef}
            offsetScrollbars
            scrollbarSize={6}
            type="always"
            h={120}
          >
            <Box 
              style={{ 
                display: 'flex',
                gap: rem(8),
                paddingBottom: rem(8),
                paddingTop: rem(4)
              }}
            >
              {dates.map((date, index) => {
                const dateIsSelected = isSameDay(date, selectedDate);
                const dateIsToday = isToday(date);
                
                return (
                  <UnstyledButton
                    key={index}
                    data-selected={dateIsSelected ? 'true' : undefined}
                    data-today={dateIsToday ? 'true' : undefined}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: rem(64),
                      padding: rem(6),
                      borderRadius: rem(8),
                      backgroundColor: dateIsSelected ? 'var(--mantine-color-blue-6)' : undefined,
                      position: 'relative'
                    }}
                  >
                    <Text 
                      fz="xs" 
                      fw={500} 
                      c={dateIsSelected ? 'white' : 'dimmed'}
                      tt="uppercase"
                    >
                      {format(date, 'E')}
                    </Text>
                    
                    <Box 
                      style={{
                        width: rem(36),
                        height: rem(36),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: rem(16),
                        fontWeight: dateIsToday || dateIsSelected ? 700 : 400,
                        margin: '4px 0',
                        borderRadius: '50%',
                        border: dateIsToday && !dateIsSelected ? '2px solid var(--mantine-color-blue-6)' : undefined,
                        color: dateIsSelected ? 'white' : undefined
                      }}
                    >
                      {format(date, 'd')}
                    </Box>
                    
                    <Text 
                      fz="xs" 
                      c={dateIsSelected ? 'white' : 'dimmed'}
                    >
                      {format(date, 'MMM')}
                    </Text>
                    
                    {/* Indicator for planned meals */}
                    {hasPlannedMeals(date) && (
                      <Box 
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '6px',
                          height: '6px',
                          backgroundColor: dateIsSelected ? 'white' : 'var(--mantine-color-blue-5)',
                          borderRadius: '50%',
                          opacity: 0.8
                        }}
                      />
                    )}
                  </UnstyledButton>
                );
              })}
            </Box>
          </ScrollArea>
        </Paper>
        
        {/* Planned meals details */}
        <Paper p="md" withBorder radius="md" mt="md">
          <Group mb="md">
            <Text fw={600} size="lg">
              Meals for {format(selectedDate, 'MMMM d, yyyy')}
            </Text>
            {selectedDatePlan?.meals.length ? (
              <Badge size="sm" variant="light" color="green">
                {selectedDatePlan.meals.length} {selectedDatePlan.meals.length === 1 ? 'meal' : 'meals'} planned
              </Badge>
            ) : null}
          </Group>
          
          {/* Meal details */}
          {getMealPlanDetails().length ? (
            <Stack spacing="md">
              {/* Organize by meal type */}
              {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
                // Get all meals of this type
                const mealsOfType = getMealPlanDetails().filter(meal => meal.type === mealType);
                
                if (mealsOfType.length === 0) return null;
                
                return (
                  <Box key={mealType}>
                    <Group mb="xs">
                      <ActionIcon 
                        color={mealIcons[mealType].color} 
                        variant="filled"
                        size="md"
                        radius="xl"
                      >
                        {React.createElement(mealIcons[mealType].icon, { size: 16 })}
                      </ActionIcon>
                      <Text fw={600}>{mealIcons[mealType].label}</Text>
                      <Badge size="sm" color={mealIcons[mealType].color}>
                        {mealsOfType.length} {mealsOfType.length === 1 ? 'meal' : 'meals'}
                      </Badge>
                    </Group>
                    
                    <Stack spacing="xs" ml="md">
                      {mealsOfType.map((meal, index) => (
                        <Paper key={meal.id || index} p="md" withBorder radius="md" bg="gray.0">
                          <Group justify="space-between">
                            <Text size="md" fw={500}>{meal.recipe?.title || 'Unknown Recipe'}</Text>
                            <Button 
                              variant="subtle" 
                              color="red" 
                              size="xs"
                              onClick={() => {
                                // Use the dedicated function to remove the meal
                                handleRemoveMeal(meal.id || '');
                              }}
                            >
                              Remove
                            </Button>
                          </Group>
                          
                          <Group justify="space-between" mt="md">
                            {meal.recipe?.ingredients && (
                              <Text size="sm" c="dimmed">
                                {meal.recipe.ingredients.length} ingredients • {meal.recipe.procedure.length} steps
                              </Text>
                            )}
                            
                            <Group spacing="xs">
                              <Text size="xs" fw={500} c="dimmed">Serves:</Text>
                              <Group spacing={5}>
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                  <ActionIcon 
                                    key={num} 
                                    size="xs"
                                    variant={meal.servings === num ? "filled" : "subtle"}
                                    color={meal.servings === num ? "blue" : "gray"}
                                    onClick={() => handleUpdateServings(meal.id || '', num)}
                                  >
                                    {num}
                                  </ActionIcon>
                                ))}
                              </Group>
                            </Group>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl">
              No meals planned for this date. Select a recipe below and click one of the meal icons to add it to your plan.
            </Text>
          )}
        </Paper>
        
        <Box mt="xl" mb="md">
          <TextInput
            placeholder="Search recipes by name, ingredients, or 'show me pasta dishes with chicken'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={18} />}
            size="md"
            radius="md"
            style={{ width: '100%' }}
          />
        </Box>
        
        <Group justify="space-between" align="center" mt="lg" mb="md">
          <Title order={2}>Available Recipes</Title>
        </Group>
        
        {recipes.length === 0 ? (
          <Paper p="xl" withBorder ta="center" c="dimmed" mt="md">
            <Text size="lg">No recipes available. Add some recipes in the Cookbook section.</Text>
          </Paper>
        ) : filteredRecipes.length === 0 ? (
          <Paper p="xl" withBorder ta="center" c="dimmed" mt="md">
            <Text size="lg">No recipes match your search. Try different keywords.</Text>
          </Paper>
        ) : (
          filteredRecipes.map(recipe => (
            <Card key={recipe.id} shadow="sm" p="lg" mb="md" radius="md" withBorder>
              <Group justify="space-between">
                <Box>
                  <Title order={3}>{recipe.title}</Title>
                  {recipe.ingredients && (
                    <Text c="dimmed" mt="xs" lineClamp={2}>
                      {recipe.ingredients.length} ingredients • {recipe.procedure.length} steps
                    </Text>
                  )}
                </Box>
                <Group gap="xs">
                  {(Object.entries(mealIcons) as Array<[
                    'breakfast' | 'lunch' | 'dinner', 
                    { icon: any; label: string; color: string }
                  ]>).map(([mealType, { icon: Icon, label, color }]) => (
                    <Tooltip key={mealType} label={`Add to ${label}`}>
                      <ActionIcon 
                        onClick={() => handleAddMeal(recipe.id, mealType)}
                        variant="light"
                        color={color}
                        radius="xl"
                        size="lg"
                      >
                        <Icon size={20} />
                      </ActionIcon>
                    </Tooltip>
                  ))}
                </Group>
              </Group>
            </Card>
          ))
        )}
        
      </Stack>
    </Container>
  );
};