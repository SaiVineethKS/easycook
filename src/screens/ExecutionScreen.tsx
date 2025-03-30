import React from 'react';
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Button, 
  Stack, 
  Grid, 
  Group, 
  Badge, 
  Paper, 
  Box, 
  List,
  Accordion
} from '@mantine/core';
import { 
  IconCoffee, 
  IconSoup, 
  IconMoon,
  IconChevronRight,
  IconClock,
  IconVideo,
  IconExternalLink
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export const ExecutionScreen = () => {
  const { getMealPlanByDate, getRecipeById } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysPlan = getMealPlanByDate(today);

  // Meal type icons with their labels and colors
  const mealIcons = {
    breakfast: { icon: IconCoffee, label: 'Breakfast', color: 'orange' },
    lunch: { icon: IconSoup, label: 'Lunch', color: 'blue' },
    dinner: { icon: IconMoon, label: 'Dinner', color: 'indigo' }
  };

  // Get all meals for today
  const getTodaysMeals = () => {
    if (!todaysPlan) return [];
    
    return todaysPlan.meals.map(meal => {
      const recipe = getRecipeById(meal.recipeId);
      if (!recipe) return null;
      
      return {
        id: meal.id || meal.recipeId,
        type: meal.type,
        recipe,
        servings: meal.servings || 2
      };
    }).filter(Boolean);
  };

  const todaysMeals = getTodaysMeals();
  
  return (
    <Container size="lg">
      <Title order={1} mb="xl" fw={800}>Today's Meals</Title>
      
      {todaysMeals.length > 0 ? (
        <Grid gutter="lg">
          {todaysMeals.map((meal, index) => {
            const MealIcon = mealIcons[meal.type].icon;
            
            return (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Paper shadow="sm" p="lg" withBorder radius="md">
                  <Stack spacing="md">
                    <Group justify="space-between">
                      <Badge 
                        size="lg" 
                        color={mealIcons[meal.type].color}
                        leftSection={<MealIcon size={14} />}
                      >
                        {mealIcons[meal.type].label}
                      </Badge>
                      
                      <Badge variant="outline">
                        Serves {meal.servings}
                      </Badge>
                    </Group>
                    
                    <Title order={2} fw={700}>{meal.recipe.title}</Title>
                    
                    <Group>
                      <Text size="sm" c="dimmed">
                        {meal.recipe.ingredients.length} ingredients • {meal.recipe.procedure.length} steps
                      </Text>
                      
                      {meal.recipe.url && (
                        <Badge 
                          component="a"
                          href={meal.recipe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="light"
                          color="blue"
                          leftSection={<IconVideo size={14} />}
                        >
                          Video Tutorial
                        </Badge>
                      )}
                    </Group>
                    
                    <Accordion>
                      <Accordion.Item value="ingredients">
                        <Accordion.Control>
                          <Text fw={600}>Ingredients</Text>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <List spacing="xs">
                            {meal.recipe.ingredients.map((ing, idx) => (
                              <List.Item key={idx}>
                                <Text span fw={500}>{ing.name}:</Text> {ing.quantity}
                              </List.Item>
                            ))}
                          </List>
                        </Accordion.Panel>
                      </Accordion.Item>
                      
                      <Accordion.Item value="procedure">
                        <Accordion.Control>
                          <Text fw={600}>Procedure</Text>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <List type="ordered" spacing="xs">
                            {meal.recipe.procedure.map((step, idx) => (
                              <List.Item key={idx}>
                                {step.replace(`Step ${idx + 1}: `, '')}
                              </List.Item>
                            ))}
                          </List>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                    
                    {meal.recipe.url && (
                      <Button
                        variant="light"
                        component="a"
                        href={meal.recipe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                        leftSection={<IconExternalLink size={16} />}
                        color="blue"
                      >
                        Open Video Tutorial
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>
            );
          })}
        </Grid>
      ) : (
        <Paper shadow="sm" p="xl" withBorder ta="center">
          <Text size="lg">No meals planned for today</Text>
          <Text size="sm" mt="md" c="dimmed">Visit the Planning section to add meals for today.</Text>
        </Paper>
      )}
    </Container>
  );
}