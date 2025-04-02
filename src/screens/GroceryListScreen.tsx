import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Stack, 
  Text,
  Paper,
  Box,
  Tooltip,
  ActionIcon,
  Badge,
  Table,
  List,
  Loader,
  Checkbox,
  Divider,
  Grid
} from '@mantine/core';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { 
  IconShoppingCart, 
  IconPrinter,
  IconInfoCircle,
  IconX
} from '@tabler/icons-react';
import { categorizeGroceryItems } from '../services/AIService';

export const GroceryListScreen = () => {
  // Grocery list state
  const [groceryDateRange, setGroceryDateRange] = useState<[Date | null, Date | null]>([new Date(), addDays(new Date(), 6)]);
  const [groceryList, setGroceryList] = useState<{ingredient: string, quantity: string, recipes: string[], category: string, checked: boolean}[]>([]);
  const [categorizing, setCategorizing] = useState(false);
  const [includedMeals, setIncludedMeals] = useState<{date: string, dateObj: Date, type: string, recipe: string}[]>([]);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error' | null}>({
    message: '',
    type: null
  });
  
  const { user } = useAuth();
  const { recipes, getMealPlanByDate, saveScreenState, getScreenState } = useStore();
  
  // Container ref for scroll position tracking
  const containerRef = useRef<HTMLDivElement>(null);
  // Throttle timer for scroll events
  const scrollThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get saved state from store
  const savedState = getScreenState('groceryList');
  
  // Check for saved date range in localStorage
  useEffect(() => {
    const savedDateRange = localStorage.getItem('groceryDateRange');
    if (savedDateRange) {
      try {
        const { start, end } = JSON.parse(savedDateRange);
        setGroceryDateRange([new Date(start), new Date(end)]);
        
        // Generate the grocery list on load
        setTimeout(() => {
          generateGroceryList();
        }, 100);
        
        // Clear the localStorage after using it
        localStorage.removeItem('groceryDateRange');
      } catch (error) {
        console.error('Error parsing saved date range:', error);
      }
    }
  }, []);
  
  // Helper function to group meals by date
  const getMealsByDate = () => {
    // Group meals by date string for display
    const groupedMeals: Record<string, {dateObj: Date, type: string, recipe: string}[]> = {};
    
    includedMeals.forEach(meal => {
      if (!groupedMeals[meal.date]) {
        groupedMeals[meal.date] = [];
      }
      groupedMeals[meal.date].push({
        dateObj: meal.dateObj,
        type: meal.type,
        recipe: meal.recipe
      });
    });
    
    // Convert to array of objects with date and meals
    return Object.entries(groupedMeals).map(([date, meals]) => {
      // Use the first meal's date object for this date group
      const dateObj = meals[0].dateObj;
      
      return {
        date,
        dateObj,
        meals: meals.sort((a, b) => {
          const typeOrder = { Breakfast: 0, Lunch: 1, Dinner: 2 };
          return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
        })
      };
    })
    // Sort by date in reverse order (newest first)
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
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
   * Get recipe details by ID
   */
  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  /**
   * Generate the grocery list based on selected date range
   */
  const generateGroceryList = async () => {
    try {
      if (!groceryDateRange[0] || !groceryDateRange[1]) {
        setFeedback({
          message: 'Please select a date range',
          type: 'error'
        });
        return;
      }
      
      setCategorizing(true);
      
      const [startDate, endDate] = groceryDateRange;
      
      // Get all meal plans within the date range
      const mealPlans = [];
      const mealsIncluded = [];
      let currentDate = startDate;
      while (currentDate <= endDate!) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const plan = getMealPlanByDate(dateStr);
        if (plan) {
          mealPlans.push({...plan, date: currentDate});
        }
        currentDate = addDays(currentDate, 1);
      }
      
      // If no meal plans found
      if (mealPlans.length === 0) {
        setFeedback({
          message: 'No meals planned in the selected date range',
          type: 'error'
        });
        setCategorizing(false);
        return;
      }
      
      // Collect all ingredients and recipes used
      const ingredientMap: Record<string, {
        quantity: number,
        unit: string,
        recipes: Set<string>
      }> = {};
      
      // Track which recipes are used
      const usedRecipes: {title: string; id: string}[] = [];
      
      mealPlans.forEach(plan => {
        plan.meals.forEach(meal => {
          const recipe = getRecipeById(meal.recipeId);
          if (!recipe || !recipe.ingredients) return;
          
          // Add to used recipes for categorization
          if (!usedRecipes.some(r => r.id === recipe.id)) {
            usedRecipes.push({
              title: recipe.title,
              id: recipe.id
            });
          }
          
          // Track included meals for display
          mealsIncluded.push({
            date: format(plan.date, 'MMM d'),
            dateObj: plan.date, // Store the actual Date object
            type: meal.type.charAt(0).toUpperCase() + meal.type.slice(1), // Capitalize meal type
            recipe: recipe.title
          });
          
          // Calculate serving multiplier
          // Default recipe serves 4 people, adjust based on planned servings
          const servingsMultiplier = (meal.servings || 2) / 4;
          
          recipe.ingredients.forEach(ingredient => {
            const standardName = ingredient.name.toLowerCase().trim();
            
            // Extract quantity and unit
            const quantityStr = ingredient.quantity;
            let quantity = parseQuantity(quantityStr) * servingsMultiplier;
            
            // Extract unit (like cups, tbsp, etc.) from the quantity string
            const unitMatch = ingredient.quantity.match(/[0-9.\/\s]+([a-zA-Z]+)/);
            const unit = unitMatch ? unitMatch[1] : '';
            
            if (ingredientMap[standardName]) {
              // If units match or if both are empty, add quantities
              if (ingredientMap[standardName].unit === unit || (!ingredientMap[standardName].unit && !unit)) {
                ingredientMap[standardName].quantity += quantity;
              } else {
                // If units don't match, keep as separate entry with modified name
                const newName = `${standardName} (${unit})`;
                if (!ingredientMap[newName]) {
                  ingredientMap[newName] = { 
                    quantity, 
                    unit, 
                    recipes: new Set([recipe.title])
                  };
                } else {
                  ingredientMap[newName].quantity += quantity;
                  ingredientMap[newName].recipes.add(recipe.title);
                }
                return;
              }
              
              // Add recipe to the set of recipes using this ingredient
              ingredientMap[standardName].recipes.add(recipe.title);
            } else {
              // First occurrence of this ingredient
              ingredientMap[standardName] = { 
                quantity, 
                unit, 
                recipes: new Set([recipe.title])
              };
            }
          });
        });
      });
      
      // Convert ingredient map to an array
      const tempGroceryItems = Object.entries(ingredientMap).map(([name, { quantity, unit, recipes }]) => {
        // Format quantity (round to 2 decimal places if needed)
        let formattedQuantity = quantity % 1 === 0 
          ? quantity.toString() 
          : quantity.toFixed(2);
          
        // Add unit if available
        if (unit) {
          formattedQuantity += ` ${unit}`;
        }
        
        return {
          ingredient: name,
          quantity: formattedQuantity,
          recipes: Array.from(recipes),
          category: 'Uncategorized', // Default category, will be replaced by Gemini API
          checked: false // Initial state is unchecked
        };
      });
      
      // Use Gemini API to categorize the ingredients
      try {
        // Extract just the ingredient names for categorization
        const ingredientNames = tempGroceryItems.map(item => item.ingredient);
        
        // Get categories from Gemini
        const categorizedIngredients = await categorizeGroceryItems(ingredientNames, usedRecipes);
        
        // Create a map for quick lookup of categories
        const categoryMap = new Map();
        categorizedIngredients.forEach(item => {
          categoryMap.set(item.ingredient, item.category);
        });
        
        // Apply categories to grocery items
        const groceryItems = tempGroceryItems.map(item => ({
          ...item,
          category: categoryMap.get(item.ingredient) || item.category,
          checked: false // Initial state is unchecked
        }));
        
        // Sort by category then by ingredient name
        groceryItems.sort((a, b) => {
          // First sort by category
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          // Then sort by ingredient name within each category
          return a.ingredient.localeCompare(b.ingredient);
        });
        
        setGroceryList(groceryItems);
        // Sort the included meals by date (newest first) and then by meal type (breakfast, lunch, dinner)
        mealsIncluded.sort((a, b) => {
          if (a.date !== b.date) {
            // Sort in reverse order (newest date first)
            return b.date.localeCompare(a.date);
          }
          const typeOrder = { Breakfast: 0, Lunch: 1, Dinner: 2 };
          return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
        });
        setIncludedMeals(mealsIncluded);
        
        // Show success feedback
        setFeedback({
          message: `Generated grocery list with ${groceryItems.length} items for ${mealsIncluded.length} meals`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error categorizing with Gemini:', error);
        
        // Fallback to alphabetical sorting if categorization fails
        tempGroceryItems.sort((a, b) => a.ingredient.localeCompare(b.ingredient));
        setGroceryList(tempGroceryItems);
        
        // Sort the included meals by date (newest first) and then by meal type
        mealsIncluded.sort((a, b) => {
          if (a.date !== b.date) {
            // Sort in reverse order (newest date first)
            return b.date.localeCompare(a.date);
          }
          const typeOrder = { Breakfast: 0, Lunch: 1, Dinner: 2 };
          return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
        });
        setIncludedMeals(mealsIncluded);
        
        setFeedback({
          message: `Generated grocery list with ${tempGroceryItems.length} items (without categorization)`,
          type: 'success'
        });
      } finally {
        setCategorizing(false);
      }
      
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
      
    } catch (error) {
      console.error('Error generating grocery list:', error);
      setFeedback({
        message: 'Failed to generate grocery list',
        type: 'error'
      });
      
      setCategorizing(false);
      
      setTimeout(() => {
        setFeedback({ message: '', type: null });
      }, 3000);
    }
  };

  // Add effects for state persistence
  useEffect(() => {
    // Save expanded categories whenever they change
    saveScreenState('groceryList', {
      expandedCategories: []  // Not implemented yet, but can be added
    });
  }, [saveScreenState]);
  
  // Restore scroll position on component mount
  useEffect(() => {
    if (containerRef.current && savedState.scrollPosition) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = savedState.scrollPosition;
        }
      }, 100); // Short delay to ensure content is rendered
    }
  }, [savedState.scrollPosition]);
  
  // Save scroll position before unmounting
  useEffect(() => {
    return () => {
      // Clear any pending throttle timer
      if (scrollThrottleTimerRef.current) {
        clearTimeout(scrollThrottleTimerRef.current);
      }
      
      if (containerRef.current) {
        saveScreenState('groceryList', {
          scrollPosition: containerRef.current.scrollTop
        });
      }
    };
  }, [saveScreenState]);
  
  // Scroll event handler with throttling to prevent glitching
  const handleScroll = () => {
    // Skip if already waiting for a throttle timer
    if (scrollThrottleTimerRef.current) return;
    
    // Set a throttle timer of 100ms
    scrollThrottleTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        saveScreenState('groceryList', {
          scrollPosition: containerRef.current.scrollTop
        });
      }
      // Clear the throttle timer
      scrollThrottleTimerRef.current = null;
    }, 100);
  };

  return (
    <Container 
      size="lg" 
      ref={containerRef}
      onScroll={handleScroll}
      style={{ 
        minHeight: '100vh',  // Use minHeight instead of fixed height
        position: 'relative', // Keep position context
        overflowX: 'hidden'  // Only hide horizontal overflow
      }}>
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
              bottom: '20px',
              right: '20px',
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
  
        {/* Grocery List Header and Controls */}
        <Group position="apart">
          <Group>
            <IconShoppingCart size={24} color="green" />
            <div>
              <Title order={2}>Grocery List</Title>
              {groceryDateRange[0] && groceryDateRange[1] && (
                <Text size="sm" c="dimmed">
                  {format(groceryDateRange[0], 'MMM d')} - {format(groceryDateRange[1], 'MMM d, yyyy')}
                </Text>
              )}
            </div>
          </Group>
          
          {groceryList.length > 0 && (
            <Group>
              <Button 
                variant="outline" 
                color="red" 
                onClick={clearCheckedItems}
              >
                Clear Checked Items
              </Button>
              <Button 
                variant="outline" 
                leftSection={<IconPrinter size={16} />}
                onClick={printGroceryList}
              >
                Print List
              </Button>
            </Group>
          )}
        </Group>
        
        {/* Date Range Selector */}
        <Paper p="md" withBorder>
          <Group position="apart" mb="lg">
            <Title order={4}>Select Date Range</Title>
          </Group>
          
          {/* Simple date selector in a single line */}
          <Group style={{ width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text fw={500} style={{ width: '45px' }}>From:</Text>
              <input 
                type="date" 
                value={groceryDateRange[0] ? format(groceryDateRange[0], 'yyyy-MM-dd') : ''} 
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : null;
                  setGroceryDateRange([newDate, groceryDateRange[1]]);
                }}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  width: '160px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text fw={500} style={{ width: '30px' }}>To:</Text>
              <input 
                type="date" 
                value={groceryDateRange[1] ? format(groceryDateRange[1], 'yyyy-MM-dd') : ''} 
                min={groceryDateRange[0] ? format(groceryDateRange[0], 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : null;
                  setGroceryDateRange([groceryDateRange[0], newDate]);
                }}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  width: '160px'
                }}
              />
            </div>
          </Group>
          
          {/* Date range display */}
          {groceryDateRange[0] && groceryDateRange[1] && (
            <Text size="sm" c="dimmed" mt="sm">
              Selected period: {format(groceryDateRange[0], 'MMM d')} - {format(groceryDateRange[1], 'MMM d, yyyy')}
            </Text>
          )}
          
          {/* Common date ranges */}
          <Box mt="lg">
            <Text fw={500} mb="md">Quick Select</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <Button 
                variant="outline" 
                onClick={() => setGroceryDateRange([new Date(), addDays(new Date(), 2)])}
                style={{ flex: '1', minWidth: '100px', padding: '0 10px' }}
              >
                Weekend
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGroceryDateRange([new Date(), addDays(new Date(), 6)])}
                style={{ flex: '1', minWidth: '100px', padding: '0 10px' }}
              >
                This Week
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGroceryDateRange([new Date(), addDays(new Date(), 13)])}
                style={{ flex: '1', minWidth: '100px', padding: '0 10px' }}
              >
                Two Weeks
              </Button>
            </div>
          </Box>
          
          <Group position="right" mt="lg">
            <Button 
              color="green" 
              size="md"
              onClick={generateGroceryList}
              disabled={!groceryDateRange[0] || !groceryDateRange[1] || categorizing}
              loading={categorizing}
              leftSection={categorizing ? <Loader size="xs" color="white" /> : null}
            >
              {categorizing ? 'AI Categorizing Ingredients...' : 'Generate Grocery List'}
            </Button>
          </Group>
        </Paper>
        
        {/* Included Meals */}
        {includedMeals.length > 0 && (
          <Box mt="md">
            <Title order={4} mb="md">Included Meals</Title>
            
            {getMealsByDate().map((dateGroup, dateIndex) => (
              <Box key={dateIndex} mb="xl">
                <Text fw={700} size="lg" mb="md">
                  {isToday(dateGroup.dateObj) 
                    ? 'Today' 
                    : isTomorrow(dateGroup.dateObj)
                      ? 'Tomorrow'
                      : dateGroup.date}
                </Text>
                
                <Grid>
                  {dateGroup.meals.map((meal, mealIndex) => (
                    <Grid.Col key={mealIndex} span={{ base: 12, sm: 6, md: 4 }}>
                      <Paper shadow="sm" p="md" withBorder>
                        <Stack gap="md">
                          <Group justify="space-between">
                            <Badge 
                              size="lg" 
                              color={
                                meal.type === "Breakfast" ? "orange" : 
                                meal.type === "Lunch" ? "blue" : "indigo"
                              }
                            >
                              {meal.type}
                            </Badge>
                          </Group>
                          
                          <Title order={3} fw={600}>{meal.recipe}</Title>
                          
                          <Group justify="space-between" mt="auto">
                            <Text size="sm" c="dimmed">
                              {isToday(dateGroup.dateObj) 
                                ? 'Today' 
                                : isTomorrow(dateGroup.dateObj)
                                  ? 'Tomorrow'
                                  : dateGroup.date}
                            </Text>
                          </Group>
                        </Stack>
                      </Paper>
                    </Grid.Col>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        )}
        
        {/* Grocery List Content */}
        <Paper p="md" withBorder>
          {categorizing ? (
            <Box py="xl" ta="center">
              <Loader size="md" color="green" />
              <Stack align="center" mt="md">
                <Text size="md" fw={500}>
                  Organizing ingredients by category...
                </Text>
                <Badge color="green" variant="light" size="lg" mt="xs">
                  <Group gap={6}>
                    <IconInfoCircle size={14} />
                    <Text size="xs">Feel free to navigate to other screens - processing will continue in the background</Text>
                  </Group>
                </Badge>
                <Text size="sm" mt="md" c="dimmed">
                  When you return to this screen, your grocery list will be automatically displayed.
                </Text>
              </Stack>
            </Box>
          ) : groceryList.length > 0 ? (
            <div id="grocery-list-printable">
              {/* No redundant meals section in the printable version */}
              <Stack spacing="md">
                {/* Group items by category */}
                {Array.from(new Set(groceryList.map(item => item.category))).map(category => {
                  const categoryItems = groceryList.filter(item => item.category === category);
                  
                  // Helper function to format category names
                  const formatCategoryName = (cat: string) => {
                    return cat
                      .split(/[\s_]/g)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  };
                  
                  return (
                    <Box key={category} mt="md">
                      <Text fw={700} size="lg" mb="xs" tt="capitalize" dataOrder="1">
                        {formatCategoryName(category)}
                      </Text>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: '5%' }}></Table.Th>
                            <Table.Th style={{ width: '55%' }}>Ingredient</Table.Th>
                            <Table.Th style={{ width: '20%' }}>Quantity</Table.Th>
                            <Table.Th style={{ width: '20%' }}>Used In</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {categoryItems.map((item, index) => {
                            const itemIndex = groceryList.findIndex(i => 
                              i.ingredient === item.ingredient && i.category === item.category
                            );
                            
                            return (
                              <Table.Tr 
                                key={index} 
                                style={{ 
                                  textDecoration: item.checked ? 'line-through' : 'none',
                                  opacity: item.checked ? 0.6 : 1
                                }}
                              >
                                <Table.Td>
                                  <Checkbox 
                                    checked={item.checked}
                                    onChange={() => toggleItemChecked(itemIndex)}
                                    size="md"
                                  />
                                </Table.Td>
                                <Table.Td>{item.ingredient}</Table.Td>
                                <Table.Td>{item.quantity}</Table.Td>
                                <Table.Td>
                                  <Tooltip 
                                    label={
                                      <List size="xs" spacing={4}>
                                        {item.recipes.map((recipe, idx) => (
                                          <List.Item key={idx}>{recipe}</List.Item>
                                        ))}
                                      </List>
                                    }
                                    position="left"
                                    multiline
                                    width={200}
                                  >
                                    <Badge color="blue" variant="light">
                                      {item.recipes.length} {item.recipes.length === 1 ? 'recipe' : 'recipes'}
                                    </Badge>
                                  </Tooltip>
                                </Table.Td>
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </Box>
                  );
                })}
              </Stack>
            </div>
          ) : (
            <Paper p="xl" withBorder ta="center" c="dimmed">
              <Text size="lg">No grocery list generated yet.</Text>
              <Text size="sm" mt="md">Use the date range selector above to generate a list based on your meal plans.</Text>
            </Paper>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};