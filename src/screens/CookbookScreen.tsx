import React, { useState, useEffect, useRef } from 'react';
import { Container, Title, TextInput, Button, Card, Text, Stack, Group, Grid, Paper, Badge, ActionIcon, Tooltip, Textarea, Loader, Alert, List, Divider, Collapse, Select, FileInput, Anchor, MultiSelect, Popover } from '@mantine/core';
import { IconTrash, IconEdit, IconPlus, IconVideo, IconBrain, IconAlertCircle, IconCheck, IconX, IconChevronRight, IconChevronDown, IconClock, IconMicrophone, IconMicrophoneOff, IconUpload, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { parseRecipe, parseRecipeFromAudio } from '../services/GeminiService';
import { AudioService } from '../services/AudioService';

interface Recipe {
  title: string;
  ingredients: { name: string; quantity: string }[];
  procedure: string[];
  url?: string;
  tags?: string[];
  suggestedTags: string[];
  isFavorite?: boolean;
}

export const CookbookScreen = () => {
  const [recipeInput, setRecipeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const { addRecipe, recipes } = useStore();
  const [expandedRecipes, setExpandedRecipes] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const audioServiceRef = useRef(new AudioService());
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [availableTags, setAvailableTags] = useState([
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'dessert',
    'high protein',
    'low carb',
    'vegetarian',
    'vegan',
    'gluten free',
    'mom\'s recipe',
    'quick & easy',
    'Vismai food chef',
    'party food',
    'healthy',
    'comfort food'
  ]);

  const handleAddRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedRecipe = await parseRecipe(recipeInput);
      setCurrentRecipe(parsedRecipe);
      // Auto-select suggested tags
      setSelectedTags(parsedRecipe.suggestedTags);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      await audioServiceRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(error instanceof Error ? error.message : 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setLoading(true);
      setError(null);
      const audioFile = await audioServiceRef.current.stopRecording();
      setIsRecording(false);
      
      // Process the audio file
      const recipe = await parseRecipeFromAudio(audioFile);
      setCurrentRecipe(recipe);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError(error instanceof Error ? error.message : 'Failed to process recording');
    } finally {
      setIsRecording(false);
      setLoading(false);
    }
  };

  const handleAudioUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      setLoading(true);
      setError(null);
      setAudioFile(file);
      
      const recipe = await parseRecipeFromAudio(file);
      setCurrentRecipe(recipe);
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(error instanceof Error ? error.message : 'Failed to process audio file');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecipe = () => {
    if (currentRecipe) {
      const isYouTubeUrl = recipeInput.includes('youtube.com') || recipeInput.includes('youtu.be');
      addRecipe({
        ...currentRecipe,
        url: isYouTubeUrl ? recipeInput : undefined,
        tags: selectedTags
      });
      setCurrentRecipe(null);
      setRecipeInput('');
      setSelectedTags([]);
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

  const handleAddNewTag = () => {
    if (newTagInput.trim()) {
      const newTag = newTagInput.toLowerCase().trim();
      if (!availableTags.includes(newTag)) {
        setAvailableTags(current => [...current, newTag]);
      }
      if (!selectedTags.includes(newTag)) {
        setSelectedTags(current => [...current, newTag]);
      }
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(current =>
      current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
    );
  };

  const toggleFavorite = (index: number) => {
    const updatedRecipes = recipes.map((recipe, i) => {
      if (i === index) {
        return { ...recipe, isFavorite: !recipe.isFavorite };
      }
      return recipe;
    });
    // Assuming you have a setRecipes function in your store
    useStore.setState({ recipes: updatedRecipes });
  };

  const RecipeDetails = ({ recipe }: { recipe: Recipe }) => (
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        audioServiceRef.current.stopRecording().catch(console.error);
      }
    };
  }, [isRecording]);

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center" fw={800}>My Cookbook</Title>
      
      <Card shadow="sm" mb="xl">
        <Stack gap="md">
          <Group>
            <TextInput
              placeholder="Enter your recipe or paste a YouTube URL"
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <Tooltip label={isRecording ? "Stop Recording" : "Start Recording"}>
              <ActionIcon 
                variant="light" 
                color={isRecording ? "red" : "blue"}
                size="lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={loading}
              >
                {isRecording ? <IconMicrophoneOff size={18} /> : <IconMicrophone size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {currentRecipe && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>Recipe Tags</Text>
              <Text size="xs" c="dimmed">Auto-selected tags based on recipe content. Click to toggle.</Text>
              
              <Group gap="xs">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    size="lg"
                    variant={selectedTags.includes(tag) ? "filled" : "light"}
                    onClick={() => toggleTag(tag)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        }
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                
                <Popover
                  opened={isAddingTag}
                  onClose={() => {
                    setIsAddingTag(false);
                    setNewTagInput(''); // Clear input when closing
                  }}
                  position="bottom"
                  width={200}
                  shadow="md"
                >
                  <Popover.Target>
                    <Badge
                      size="lg"
                      variant="dot"
                      onClick={() => setIsAddingTag(true)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      styles={{
                        root: {
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          }
                        }
                      }}
                    >
                      + Add Tag
                    </Badge>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Text size="sm">Add New Tag</Text>
                        <ActionIcon 
                          size="sm" 
                          variant="subtle" 
                          onClick={() => {
                            setIsAddingTag(false);
                            setNewTagInput('');
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Group>
                      <TextInput
                        placeholder="Enter new tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewTag();
                          } else if (e.key === 'Escape') {
                            setIsAddingTag(false);
                            setNewTagInput('');
                          }
                        }}
                        size="xs"
                        autoFocus
                      />
                      <Group grow>
                        <Button 
                          size="xs" 
                          variant="light" 
                          onClick={() => {
                            setIsAddingTag(false);
                            setNewTagInput('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="xs" 
                          onClick={handleAddNewTag}
                          disabled={!newTagInput.trim()}
                        >
                          Add
                        </Button>
                      </Group>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Stack>
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
              disabled={!recipeInput || loading || isRecording}
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
        {recipes.map((recipe, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
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
                    <Tooltip label="Favorite Recipe">
                      <ActionIcon
                        variant="subtle"
                        color={recipe.isFavorite ? "red" : "gray"}
                        onClick={() => toggleFavorite(index)}
                        aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {recipe.isFavorite ? (
                          <IconHeartFilled size={20} style={{ fill: 'var(--mantine-color-red-6)' }} />
                        ) : (
                          <IconHeart size={20} />
                        )}
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
                    {recipe.url && (
                      <Badge 
                        component="a"
                        href={recipe.url}
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
                  <Tooltip label={expandedRecipes.includes(index.toString()) ? "Collapse" : "Expand"}>
                    <ActionIcon 
                      variant="light" 
                      onClick={() => toggleRecipeExpansion(index.toString())}
                    >
                      {expandedRecipes.includes(index.toString()) ? 
                        <IconChevronDown size={18} /> : 
                        <IconChevronRight size={18} />
                      }
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <Collapse in={expandedRecipes.includes(index.toString())}>
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

                <Button 
                  variant="light" 
                  onClick={() => toggleRecipeExpansion(index.toString())} 
                  mt="md"
                  leftSection={expandedRecipes.includes(index.toString()) ? 
                    <IconChevronDown size={16} /> : 
                    <IconChevronRight size={16} />
                  }
                >
                  {expandedRecipes.includes(index.toString()) ? 'Show Less' : 'Show More'}
                </Button>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};