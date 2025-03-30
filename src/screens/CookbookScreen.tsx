import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Card, Text, Stack, Group, Grid, Paper, Badge, ActionIcon, Tooltip, Textarea, Loader, Alert, List, Divider, Collapse, Select, FileInput } from '@mantine/core';
import { IconTrash, IconEdit, IconPlus, IconVideo, IconBrain, IconAlertCircle, IconCheck, IconX, IconChevronRight, IconChevronDown, IconClock, IconMicrophone, IconMicrophoneOff, IconUpload } from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { parseRecipe, parseRecipeFromAudio } from '../services/GeminiService';
import { AudioService } from '../services/AudioService';

export const CookbookScreen = () => {
  const [recipeInput, setRecipeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<any>(null);
  const { addRecipe, recipes } = useStore();
  const [expandedRecipes, setExpandedRecipes] = useState<string[]>([]);

  const handleAddRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedRecipe = await parseRecipe(recipeInput);
      setCurrentRecipe(parsedRecipe);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecipe = () => {
    if (currentRecipe) {
      addRecipe({
        id: Date.now().toString(),
        ...currentRecipe,
        createdAt: new Date()
      });
      setCurrentRecipe(null);
      setRecipeInput('');
    }
  };

  const handleRejectRecipe = () => {
    setCurrentRecipe(null);
  };

  const toggleRecipeExpansion = (recipeId: string) => {
    setExpandedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const RecipeDetails = ({ recipe }: { recipe: any }) => (
    <Paper withBorder p="md">
      <Stack>
        <Group mb="xs">
          <IconBrain size={20} />
          <Title order={4}>{recipe.title}</Title>
        </Group>

        <Divider />

        <Stack>
          <Title order={5}>Ingredients:</Title>
          <Grid>
            {recipe.ingredients.map((ing: any, index: number) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                <Group>
                  <Text size="sm" fw={500}>{ing.name}:</Text>
                  <Text size="sm" c="dimmed">{ing.quantity}</Text>
                </Group>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>

        <Divider />

        <Stack>
          <Title order={5}>Procedure:</Title>
          <List type="ordered" spacing="xs">
            {recipe.procedure.map((step: string, index: number) => (
              <List.Item key={index}>
                <Text size="sm">{step.replace(`Step ${index + 1}: `, '')}</Text>
              </List.Item>
            ))}
          </List>
        </Stack>
      </Stack>
    </Paper>
  );

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center" fw={800}>My Cookbook</Title>
      
      <Card shadow="sm" mb="xl">
        <Stack gap="md">
          <TextInput
            placeholder="Enter your recipe or paste a YouTube URL"
            value={recipeInput}
            onChange={(e) => setRecipeInput(e.target.value)}
            style={{ flex: 1 }}
          />

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {currentRecipe ? (
            <Stack>
              <Group justify="space-between" mb="xs">
                <Group>
                  <IconBrain size={20} />
                  <Text fw={500}>AI Generated Recipe</Text>
                </Group>
                <Group>
                  <Tooltip label="Accept Recipe">
                    <ActionIcon variant="light" color="easyCookSage" onClick={handleAcceptRecipe}>
                      <IconCheck size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Reject Recipe">
                    <ActionIcon variant="light" color="red" onClick={handleRejectRecipe}>
                      <IconX size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
              <RecipeDetails recipe={currentRecipe} />
            </Stack>
          ) : (
            <Button 
              onClick={handleAddRecipe} 
              disabled={!recipeInput || loading}
              leftSection={loading ? <Loader size="xs" /> : <IconPlus size={16} />}
              fullWidth
              variant="filled"
            >
              {loading ? 'Processing...' : 'Add Recipe'}
            </Button>
          )}
        </Stack>
      </Card>

      <Grid gutter="lg">
        {recipes.map((recipe) => (
          <Grid.Col key={recipe.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Paper shadow="sm" p="md">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Title order={3} fw={700} style={{ flex: 1 }}>{recipe.title}</Title>
                  <Group gap="xs">
                    <Tooltip label="Edit Recipe">
                      <ActionIcon variant="light" size="lg">
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Recipe">
                      <ActionIcon variant="light" color="red" size="lg">
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                <Group gap="xs" wrap="wrap">
                  {recipe.ingredients.map((ing, index) => (
                    <Badge key={index} variant="light">
                      {ing.name}
                    </Badge>
                  ))}
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    {recipe.youtubeUrl && (
                      <Badge 
                        component="a"
                        href={recipe.youtubeUrl}
                        target="_blank"
                        variant="light"
                        leftSection={<IconVideo size={12} />}
                      >
                        Watch Tutorial
                      </Badge>
                    )}
                    <Badge variant="light" leftSection={<IconClock size={12} />}>
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </Badge>
                  </Group>
                  <Tooltip label={expandedRecipes.includes(recipe.id) ? "Collapse" : "Expand"}>
                    <ActionIcon 
                      variant="light" 
                      onClick={() => toggleRecipeExpansion(recipe.id)}
                    >
                      {expandedRecipes.includes(recipe.id) ? 
                        <IconChevronDown size={18} /> : 
                        <IconChevronRight size={18} />
                      }
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <Collapse in={expandedRecipes.includes(recipe.id)}>
                  <Divider my="xs" />
                  <Stack>
                    <Title order={5}>Ingredients:</Title>
                    <List>
                      {recipe.ingredients.map((ing: any, index: number) => (
                        <List.Item key={index}>
                          <Text size="sm">
                            <Text span fw={500}>{ing.name}:</Text> {ing.quantity}
                          </Text>
                        </List.Item>
                      ))}
                    </List>

                    <Title order={5} mt="sm">Procedure:</Title>
                    <List type="ordered">
                      {recipe.procedure.map((step: string, index: number) => (
                        <List.Item key={index}>
                          <Text size="sm">{step.replace(`Step ${index + 1}: `, '')}</Text>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                </Collapse>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};