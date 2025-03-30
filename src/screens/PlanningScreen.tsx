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
  rem
} from '@mantine/core';
import { useStore } from '../store/useStore';
import { format, addDays, isToday, isSameDay } from 'date-fns';

export const PlanningScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const { recipes, addMealPlan, getMealPlanByDate } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
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

  const handleAddMeal = (recipeId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingPlan = getMealPlanByDate(dateStr);

    if (existingPlan) {
      const updatedMeals = [...existingPlan.meals];
      const mealIndex = updatedMeals.findIndex(meal => meal.type === selectedMealType);
      
      if (mealIndex >= 0) {
        updatedMeals[mealIndex] = { type: selectedMealType, recipeId };
      } else {
        updatedMeals.push({ type: selectedMealType, recipeId });
      }
      
      addMealPlan({
        date: dateStr,
        meals: updatedMeals,
      });
    } else {
      addMealPlan({
        date: dateStr,
        meals: [{ type: selectedMealType, recipeId }],
      });
    }
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

        <Group mt="md">
          {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
            <Button
              key={type}
              variant={selectedMealType === type ? 'filled' : 'light'}
              onClick={() => setSelectedMealType(type)}
              radius="md"
              size="md"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </Group>

        <Title order={2} mt="md">Available Recipes</Title>
        
        {recipes.length === 0 ? (
          <Paper p="xl" withBorder ta="center" c="dimmed">
            <Text size="lg">No recipes available. Add some recipes in the Cookbook section.</Text>
          </Paper>
        ) : (
          recipes.map(recipe => (
            <Card key={recipe.id} shadow="sm" p="lg" mb="md" withBorder radius="md">
              <Group justify="space-between">
                <Title order={3}>{recipe.title}</Title>
                <Button 
                  onClick={() => handleAddMeal(recipe.id)}
                  radius="md"
                  variant="light"
                >
                  Add to {selectedMealType}
                </Button>
              </Group>
              {recipe.ingredients && (
                <Text c="dimmed" mt="xs" lineClamp={2}>
                  {recipe.ingredients.length} ingredients • {recipe.procedure.length} steps
                </Text>
              )}
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
}