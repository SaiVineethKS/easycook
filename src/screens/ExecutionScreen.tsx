import React from 'react';
import { Container, Title, Card, Text, Button, Stack } from '@mantine/core';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export const ExecutionScreen = () => {
  const { getMealPlanByDate, getRecipeById } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysPlan = getMealPlanByDate(today);

  const renderMeal = (type: 'breakfast' | 'lunch' | 'dinner') => {
    const meal = todaysPlan?.meals.find(m => m.type === type);
    if (!meal) return null;

    const recipe = getRecipeById(meal.recipeId);
    if (!recipe) return null;

    return (
      <Card shadow="sm" p="lg" mb="lg">
        <Title order={2}>{type.charAt(0).toUpperCase() + type.slice(1)}: {recipe.title}</Title>
        
        <Title order={3} mt="md">Ingredients:</Title>
        {recipe.ingredients.map((ing, index) => (
          <Text key={index}>{ing.quantity} {ing.name}</Text>
        ))}

        <Title order={3} mt="md">Procedure:</Title>
        {recipe.procedure.map((step, index) => (
          <Text key={index} mb="xs">
            {index + 1}. {step}
          </Text>
        ))}

        {recipe.youtubeUrl && (
          <Button
            variant="light"
            mt="md"
            component="a"
            href={recipe.youtubeUrl}
            target="_blank"
          >
            Watch Tutorial
          </Button>
        )}
      </Card>
    );
  };

  return (
    <Container size="lg">
      <Title order={1} mb="lg">Today's Meals</Title>
      
      {todaysPlan ? (
        <Stack>
          {renderMeal('breakfast')}
          {renderMeal('lunch')}
          {renderMeal('dinner')}
        </Stack>
      ) : (
        <Card shadow="sm" p="lg">
          <Text>No meals planned for today</Text>
        </Card>
      )}
    </Container>
  );
}