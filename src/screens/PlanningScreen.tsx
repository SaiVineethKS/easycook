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
  TextInput
} from '@mantine/core';
import { IconSearch, IconShoppingCart } from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { IconCoffee, IconSoup, IconMoon } from '@tabler/icons-react';

export const PlanningScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { recipes, addMealPlan, getMealPlanByDate } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Meal type icons with their labels
  const mealIcons = {
    breakfast: { icon: IconCoffee, label: 'Breakfast', color: 'orange' },
    lunch: { icon: IconSoup, label: 'Lunch', color: 'blue' },
    dinner: { icon: IconMoon, label: 'Dinner', color: 'indigo' }
  };
  
  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.ingredients?.some(ing => 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  // Generate dates for 3 months before and after current date (180 days total)
  const generateDates = () => {
    const dates = [];
    for (let i = -90; i <= 90; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };
  
  const dates = generateDates();
  
  // Scroll to today's date when component mounts
  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const handleAddMeal = (recipeId: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingPlan = getMealPlanByDate(dateStr);

    if (existingPlan) {
      const updatedMeals = [...existingPlan.meals];
      const mealIndex = updatedMeals.findIndex(meal => meal.type === mealType);
      
      if (mealIndex >= 0) {
        updatedMeals[mealIndex] = { type: mealType, recipeId };
      } else {
        updatedMeals.push({ type: mealType, recipeId });
      }
      
      addMealPlan({
        date: dateStr,
        meals: updatedMeals,
      });
    } else {
      addMealPlan({
        date: dateStr,
        meals: [{ type: mealType, recipeId }],
      });
    }
  };
  
  // Function to generate grocery list from current week's meal plans
  const handleCreateGroceryList = () => {
    // Get the current week's meal plans
    alert("Grocery list feature coming soon! This will generate a shopping list based on your meal plan.");
    
    // In the future, this would:
    // 1. Collect all recipes from the week's meal plans
    // 2. Aggregate all ingredients with quantities
    // 3. Optimize by combining similar items
    // 4. Generate a printable/saveable grocery list
  };

  return (
    <Container size="lg">
      <Stack spacing="md">
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
                      backgroundColor: dateIsSelected ? 'var(--mantine-color-blue-6)' : undefined
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
                  </UnstyledButton>
                );
              })}
            </Box>
          </ScrollArea>
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
          <Button
            leftSection={<IconShoppingCart size={18} />}
            onClick={handleCreateGroceryList}
            variant="light"
            color="green"
            radius="md"
            size="sm"
          >
            Create Grocery List
          </Button>
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
            <Card key={recipe.id} shadow="sm" p="lg" mb="md" withBorder radius="md">
              <Group justify="space-between">
                <Box>
                  <Title order={3}>{recipe.title}</Title>
                  {recipe.ingredients && (
                    <Text c="dimmed" mt="xs" lineClamp={2}>
                      {recipe.ingredients.length} ingredients • {recipe.procedure.length} steps
                    </Text>
                  )}
                </Box>
                <Group gap="sm">
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
}