import React from 'react';
import { Container, Title, Button, Card, Group, Stack } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export const PlanningScreen = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedMealType, setSelectedMealType] = React.useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const { recipes, addMealPlan, getMealPlanByDate } = useStore();

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
      <Stack>
        <DatePicker
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
        />

        <Group>
          {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
            <Button
              key={type}
              variant={selectedMealType === type ? 'filled' : 'light'}
              onClick={() => setSelectedMealType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </Group>

        <Title order={2}>Available Recipes</Title>
        
        {recipes.map(recipe => (
          <Card key={recipe.id} shadow="sm" p="lg" mb="md">
            <Group position="apart">
              <Title order={3}>{recipe.title}</Title>
              <Button onClick={() => handleAddMeal(recipe.id)}>
                Add to {selectedMealType}
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}