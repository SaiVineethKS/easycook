import React, { useState, useEffect, useRef } from 'react';
import { Container, Title, TextInput, Button, Card, Text, Stack, Group, Grid, Paper, Badge, ActionIcon, Tooltip, Textarea, Loader, Alert, List, Divider, Collapse, Select, FileInput, Anchor, MultiSelect, Popover, NumberInput, Modal } from '@mantine/core';
import { IconTrash, IconEdit, IconPlus, IconVideo, IconBrain, IconAlertCircle, IconCheck, IconX, IconChevronRight, IconChevronDown, IconClock, IconMicrophone, IconMicrophoneOff, IconUpload, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { parseRecipe, parseRecipeFromAudio } from '../services/GeminiService';
import { AudioService } from '../services/AudioService';

interface Recipe {
  id: string;  // Unique identifier for database storage
  title: string;
  ingredients: { name: string; quantity: string }[];
  procedure: string[];
  url?: string;
  tags?: string[];
  suggestedTags: string[];
  isFavorite?: boolean;
  servings: number;
  numberOfMeals: number;
  createdAt: Date;
  aiResponse?: string;
  metadata: {
    source: 'youtube' | 'text' | 'audio';
    originalInput?: string;
    processingDate: Date;
  };
}

export const CookbookScreen = () => {
  const [recipeInput, setRecipeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const { addRecipe, recipes, deleteRecipe } = useStore();
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
  const [servings, setServings] = useState(4); // Default 4 people
  const [numberOfMeals, setNumberOfMeals] = useState(1); // Default 1 meal
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const handleAddRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedRecipe = await parseRecipe(recipeInput);
      const isYouTubeUrl = recipeInput.includes('youtube.com') || recipeInput.includes('youtu.be');
      
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: parsedRecipe.title,
        ingredients: parsedRecipe.ingredients,
        procedure: parsedRecipe.procedure,
        url: isYouTubeUrl ? recipeInput : undefined,
        tags: selectedTags,
        suggestedTags: parsedRecipe.suggestedTags,
        isFavorite: false,
        servings,
        numberOfMeals,
        createdAt: new Date(),
        aiResponse: parsedRecipe.aiResponse,
        metadata: {
          source: isYouTubeUrl ? 'youtube' : 'text',
          originalInput: recipeInput,
          processingDate: new Date()
        }
      };
      
      setCurrentRecipe(newRecipe);
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
      
      const parsedRecipe = await parseRecipeFromAudio(audioFile);
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: parsedRecipe.title,
        ingredients: parsedRecipe.ingredients,
        procedure: parsedRecipe.procedure,
        suggestedTags: [],
        servings: 4, // Default value
        numberOfMeals: 1, // Default value
        createdAt: new Date(),
        aiResponse: parsedRecipe.aiResponse,
        metadata: {
          source: 'audio',
          processingDate: new Date()
        }
      };
      
      setCurrentRecipe(newRecipe);
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
      
      const parsedRecipe = await parseRecipeFromAudio(file);
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: parsedRecipe.title,
        ingredients: parsedRecipe.ingredients,
        procedure: parsedRecipe.procedure,
        suggestedTags: [],
        servings: 4, // Default value
        numberOfMeals: 1, // Default value
        createdAt: new Date(),
        aiResponse: parsedRecipe.aiResponse,
        metadata: {
          source: 'audio',
          processingDate: new Date()
        }
      };
      
      setCurrentRecipe(newRecipe);
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
        tags: selectedTags,
        servings,
        numberOfMeals
      });
      setCurrentRecipe(null);
      setRecipeInput('');
      setSelectedTags([]);
      setServings(4); // Reset to default
      setNumberOfMeals(1); // Reset to default
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

  const updateServings = (index: number, value: number) => {
    const updatedRecipes = recipes.map((recipe, i) => {
      if (i === index) {
        return { ...recipe, servings: value };
      }
      return recipe;
    });
    useStore.setState({ recipes: updatedRecipes });
  };

  const updateNumberOfMeals = (index: number, value: number) => {
    const updatedRecipes = recipes.map((recipe, i) => {
      if (i === index) {
        return { ...recipe, numberOfMeals: value };
      }
      return recipe;
    });
    useStore.setState({ recipes: updatedRecipes });
  };

  const handleDelete = (index: number) => {
    setDeleteConfirmIndex(null);
    deleteRecipe(index);
  };

  const RecipeDetails = ({ recipe }: { recipe: Recipe }) => (
    <Stack gap="md">
      <div>
        <Text fw={500} mb="xs">Ingredients:</Text>
        <List>
          {recipe.ingredients.map((ingredient, index) => (
            <List.Item key={index}>
              {ingredient.quantity} {ingredient.name}
            </List.Item>
          ))}
        </List>
      </div>

      <div>
        <Text fw={500} mb="xs">Procedure:</Text>
        <List>
          {recipe.procedure.map((step, index) => (
            <List.Item key={index}>{step}</List.Item>
          ))}
        </List>
      </div>

      <div>
        <Text fw={500} mb="xs">Metadata:</Text>
        <Text size="sm" c="dimmed">
          Source: {recipe.metadata.source}
          {recipe.metadata.originalInput && ` | Original Input: ${recipe.metadata.originalInput}`}
          {` | Created: ${new Date(recipe.createdAt).toLocaleDateString()}`}
        </Text>
      </div>
    </Stack>
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

              <Group grow>
                <NumberInput
                  label="Number of People"
                  description="How many people can this serve?"
                  value={servings}
                  onChange={(value) => setServings(Number(value))}
                  min={1}
                  max={20}
                  placeholder="Enter number of servings"
                />
                <NumberInput
                  label="Number of Meals"
                  description="How many meals can be made?"
                  value={numberOfMeals}
                  onChange={(value) => setNumberOfMeals(Number(value))}
                  min={1}
                  max={10}
                  placeholder="Enter number of meals"
                />
              </Group>
            </Stack>
          )}

          {currentRecipe ? (
            <Stack>
              <Card withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                  <Group>
                    <IconBrain size={24} color="var(--mantine-color-blue-6)" />
                    <Text fw={600} size="lg">AI Generated Recipe</Text>
                  </Group>
                  <Group>
                    <Tooltip label="Accept Recipe">
                      <ActionIcon 
                        variant="light" 
                        color="green" 
                        size="lg"
                        onClick={handleAcceptRecipe}
                      >
                        <IconCheck size={20} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Reject Recipe">
                      <ActionIcon 
                        variant="light" 
                        color="red" 
                        size="lg"
                        onClick={handleRejectRecipe}
                      >
                        <IconX size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>

                <Stack gap="lg">
                  <div>
                    <Text fw={500} size="sm" c="dimmed" mb="xs">Ingredients:</Text>
                    <List spacing="xs">
                      {currentRecipe.ingredients.map((ingredient, index) => (
                        <List.Item key={index}>
                          <Text size="sm">
                            <Text span fw={500}>{ingredient.name}:</Text> {ingredient.quantity}
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  </div>

                  <div>
                    <Text fw={500} size="sm" c="dimmed" mb="xs">Procedure:</Text>
                    <List type="ordered" spacing="xs">
                      {currentRecipe.procedure.map((step, index) => (
                        <List.Item key={index}>
                          <Text size="sm">{step.replace(`Step ${index + 1}: `, '')}</Text>
                        </List.Item>
                      ))}
                    </List>
                  </div>
                </Stack>
              </Card>
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
                </Group>

                <Collapse in={expandedRecipes.includes(index.toString())}>
                  <RecipeDetails recipe={recipe} />
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

                <Group mb="xs" align="center">
                  <Text size="sm" c="dimmed">
                    Serves: <Text span fw={500}>{recipe.servings} people</Text>
                  </Text>
                  <Divider orientation="vertical" />
                  <Text size="sm" c="dimmed">
                    For: <Text span fw={500}>{recipe.numberOfMeals} meals</Text>
                  </Text>
                </Group>

                {recipe.url && (
                  <Text size="sm" c="dimmed" mb="xs">
                    <Anchor href={recipe.url} target="_blank" rel="noopener noreferrer">
                      View Original Video
                    </Anchor>
                  </Text>
                )}

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <Group gap="xs" mb="xs">
                    {recipe.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="light">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                  opened={deleteConfirmIndex === index}
                  onClose={() => setDeleteConfirmIndex(null)}
                  title="Confirm Delete"
                  size="sm"
                >
                  <Stack>
                    <Text>Are you sure you want to delete "{recipe.title}"?</Text>
                    <Group justify="flex-end">
                      <Button 
                        variant="light" 
                        onClick={() => setDeleteConfirmIndex(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        color="red" 
                        onClick={() => handleDelete(index)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Stack>
                </Modal>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};