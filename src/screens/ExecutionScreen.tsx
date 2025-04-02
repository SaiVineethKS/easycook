import React, { useState, useEffect, useRef } from 'react';
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
  Accordion,
  ActionIcon,
  Divider
} from '@mantine/core';
import { 
  IconCoffee, 
  IconSoup, 
  IconMoon,
  IconChevronRight,
  IconChevronLeft,
  IconClock,
  IconVideo,
  IconExternalLink,
  IconChefHat,
  IconListDetails
} from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export const ExecutionScreen = () => {
  // State for recipe procedure carousel
  const [selectedMeal, setSelectedMeal] = useState<{recipeId: string, recipeName: string} | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const { getMealPlanByDate, getRecipeById, recipes, saveScreenState, getScreenState } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysPlan = getMealPlanByDate(today);
  
  // Get saved state from store
  const savedState = getScreenState('execution');

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
  
  // Initialize state from saved values or auto-select first meal
  useEffect(() => {
    // Restore selected meal if saved
    if (savedState.selectedMealId && savedState.selectedMealName) {
      setSelectedMeal({
        recipeId: savedState.selectedMealId,
        recipeName: savedState.selectedMealName
      });
      
      // Restore step index
      if (savedState.currentStepIndex !== undefined) {
        const stepIndex = savedState.currentStepIndex;
        setCurrentStepIndex(stepIndex);
        
        // Find the recipe and set the timestamp
        const recipe = recipes.find(r => r.id === savedState.selectedMealId);
        if (recipe?.timestamps) {
          const timestampEntry = recipe.timestamps.find(t => t.step === stepIndex + 1);
          if (timestampEntry?.timestamp) {
            const seconds = convertTimestampToSeconds(timestampEntry.timestamp);
            setCurrentTimestamp(seconds); // Set initial timestamp
            console.log(`Restored with step ${stepIndex + 1}, timestamp: ${timestampEntry.timestamp} (${seconds}s)`);
          }
        }
      }
    } 
    // Otherwise auto-select the first meal if available
    else if (todaysMeals.length > 0) {
      const firstMeal = todaysMeals[0];
      setSelectedMeal({
        recipeId: firstMeal.recipe.id,
        recipeName: firstMeal.recipe.title
      });
      setCurrentStepIndex(0);
      
      // Set initial timestamp for first meal
      const recipe = recipes.find(r => r.id === firstMeal.recipe.id);
      if (recipe?.timestamps) {
        const timestampEntry = recipe.timestamps.find(t => t.step === 1);
        if (timestampEntry?.timestamp) {
          const seconds = convertTimestampToSeconds(timestampEntry.timestamp);
          setCurrentTimestamp(seconds);
          console.log(`Auto-selected first meal with timestamp: ${timestampEntry.timestamp} (${seconds}s)`);
        }
      }
    }
  }, []);
  
  // Handle meal selection for procedure carousel
  const handleSelectMeal = (recipeId: string, recipeName: string) => {
    console.log('Meal selected:', { recipeId, recipeName });
    
    // Check if the recipe exists in our recipes array
    const recipe = recipes.find(r => r.id === recipeId);
    console.log('Recipe exists in recipes array:', !!recipe);
    
    if (!recipe) {
      console.error('Selected recipe not found in recipes array. This will cause the carousel to not display properly.');
      return;
    }
    
    setSelectedMeal({ recipeId, recipeName });
    setCurrentStepIndex(0); // Reset to first step
    
    // Save selection to persistent state
    saveScreenState('execution', {
      selectedMealId: recipeId,
      selectedMealName: recipeName,
      currentStepIndex: 0
    });
    
    // Initialize the timestamp from the first step if available
    if (recipe.timestamps) {
      const firstTimestamp = recipe.timestamps.find(t => t.step === 1);
      if (firstTimestamp?.timestamp) {
        const seconds = convertTimestampToSeconds(firstTimestamp.timestamp);
        setCurrentTimestamp(seconds);
        setReloadVideo(prev => !prev); // Force iframe reload
        console.log(`Selected meal "${recipeName}" with first step timestamp: ${firstTimestamp.timestamp} (${seconds}s)`);
      } else {
        console.log(`Selected meal "${recipeName}" has no timestamp for first step`);
        setCurrentTimestamp(0);
      }
    } else {
      console.log(`Selected meal "${recipeName}" has no timestamps`);
      setCurrentTimestamp(0);
    }
  };
  
  // State to track if video should reload and current timestamp
  const [reloadVideo, setReloadVideo] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  
  // Function to navigate to a specific step
  const navigateToStep = (newIndex: number) => {
    const recipe = recipes.find(r => r.id === selectedMeal?.recipeId);
    if (!recipe || !recipe.procedure) return;
    
    setCurrentStepIndex(newIndex);
    
    // Get video ID and timestamp
    const videoId = getYoutubeVideoId(recipe.url);
    if (!videoId) return;
    
    // Find timestamp for this step
    const timestampEntry = recipe.timestamps?.find(t => t.step === newIndex + 1);
    
    if (timestampEntry && timestampEntry.timestamp) {
      // Get seconds from timestamp
      const seconds = convertTimestampToSeconds(timestampEntry.timestamp);
      setCurrentTimestamp(seconds);
      
      // Force iframe reload with new timestamp
      setReloadVideo(prev => !prev); // Toggle to force re-render
    }
  };
  
  // Navigate to next step in the procedure
  const handleNextStep = () => {
    const recipe = recipes.find(r => r.id === selectedMeal?.recipeId);
    if (recipe && recipe.procedure) {
      const newIndex = currentStepIndex < recipe.procedure.length - 1 ? currentStepIndex + 1 : 0;
      navigateToStep(newIndex);
    }
  };
  
  // Navigate to previous step in the procedure
  const handlePrevStep = () => {
    const recipe = recipes.find(r => r.id === selectedMeal?.recipeId);
    if (recipe && recipe.procedure) {
      const newIndex = currentStepIndex > 0 ? currentStepIndex - 1 : recipe.procedure.length - 1;
      navigateToStep(newIndex);
    }
  };
  
  // Get the procedure for the selected meal
  const getSelectedRecipeProcedure = () => {
    console.log('Looking for recipe with ID:', selectedMeal?.recipeId);
    
    const recipe = recipes.find(r => r.id === selectedMeal?.recipeId);
    console.log('Found recipe:', recipe?.title || 'Not found');
    
    if (!recipe) {
      console.error('Recipe not found in recipes array. This will result in empty procedure steps.');
    }
    
    return recipe?.procedure || [];
  };
  
  // Get the selected recipe object
  const getSelectedRecipe = () => {
    return recipes.find(r => r.id === selectedMeal?.recipeId);
  };
  
  // Extract YouTube video ID from url
  const getYoutubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    
    // Common YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
      /youtube\.com\/embed\/([^&\?\/]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Try to use videoId from metadata if available
    const recipe = getSelectedRecipe();
    if (recipe?.metadata?.videoId) {
      return recipe.metadata.videoId;
    }
    
    return null;
  };
  
  // Get timestamp for current step
  const getCurrentStepTimestamp = (): string | null => {
    const recipe = getSelectedRecipe();
    if (!recipe?.timestamps) return null;
    
    const timestamp = recipe.timestamps.find(t => t.step === currentStepIndex + 1);
    
    // If we find a timestamp, update the currentTimestamp state (time in seconds)
    if (timestamp?.timestamp) {
      const seconds = convertTimestampToSeconds(timestamp.timestamp);
      // Don't update state here to avoid render loops, but return the timestamp string
    }
    
    return timestamp?.timestamp || null;
  };
  
  // State to store YouTube iframe reference
  const youtubePlayerRef = useRef<HTMLIFrameElement>(null);
  
  // Convert timestamp to seconds
  const convertTimestampToSeconds = (timestamp: string | null): number => {
    if (!timestamp) return 0;
    
    // Handle MM:SS format (e.g. "12:34")
    if (/^\d{1,2}:\d{2}$/.test(timestamp)) {
      const [minutes, seconds] = timestamp.split(':').map(Number);
      return minutes * 60 + seconds;
    }
    
    // Handle HH:MM:SS format (e.g. "1:12:34")
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timestamp)) {
      const parts = timestamp.split(':').map(Number);
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    // Handle seconds only (e.g. "123")
    if (/^\d+$/.test(timestamp)) {
      return parseInt(timestamp);
    }
    
    // Default case
    return 0;
  };
  
  // Generate YouTube timestamp URL
  const generateYoutubeTimestampUrl = (videoId: string, timestamp: string | null): string => {
    if (!videoId || !timestamp) return `https://www.youtube.com/watch?v=${videoId}`;
    
    const timeInSeconds = convertTimestampToSeconds(timestamp);
    return `https://www.youtube.com/watch?v=${videoId}&t=${timeInSeconds}s`;
  };
  
  // Update timestamp and save state when current step changes
  useEffect(() => {
    if (!selectedMeal) return;

    // Save to persistent storage
    saveScreenState('execution', {
      currentStepIndex
    });
    
    // Update timestamp based on the new step
    const recipe = getSelectedRecipe();
    if (recipe?.timestamps) {
      const timestampEntry = recipe.timestamps.find(t => t.step === currentStepIndex + 1);
      if (timestampEntry?.timestamp) {
        const seconds = convertTimestampToSeconds(timestampEntry.timestamp);
        setCurrentTimestamp(seconds);
        setReloadVideo(prev => !prev); // Toggle to force iframe reload
        
        console.log(`Step changed to ${currentStepIndex + 1}, setting timestamp to ${timestampEntry.timestamp} (${seconds}s)`);
      }
    }
  }, [currentStepIndex, selectedMeal, saveScreenState]);
  
  // Effect to update timestamp from getCurrentStepTimestamp
  useEffect(() => {
    const timestamp = getCurrentStepTimestamp();
    if (timestamp) {
      const seconds = convertTimestampToSeconds(timestamp);
      // Only update if different to avoid infinite loops
      if (Math.abs(seconds - currentTimestamp) > 1) {
        console.log(`Updating timestamp from ${currentTimestamp}s to ${seconds}s based on current step`);
        setCurrentTimestamp(seconds);
      }
    }
  }, [selectedMeal, currentStepIndex, currentTimestamp]);
  
  return (
    <Container size="lg">
      <Title order={1} mb="xl" fw={800}>Today's Meals</Title>
      
      {todaysMeals.length > 0 ? (
        <Grid gutter="lg">
          {todaysMeals.map((meal, index) => {
            const MealIcon = mealIcons[meal.type].icon;
            
            return (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Paper 
                  shadow="sm" 
                  p="lg" 
                  withBorder 
                  radius="md"
                  onClick={(e) => {
                    console.log('Card clicked, recipeId:', meal.recipe.id);
                    
                    // Visual feedback for the clicked element
                    const paperElement = e.currentTarget as HTMLElement;
                    if (paperElement) {
                      paperElement.style.transform = 'scale(1.05)';
                      setTimeout(() => {
                        paperElement.style.transform = '';
                      }, 200);
                    }
                    
                    // Actual state update
                    handleSelectMeal(meal.recipe.id, meal.recipe.title);
                    
                    // Scroll to carousel if it exists
                    setTimeout(() => {
                      const carousel = document.getElementById('recipe-carousel');
                      if (carousel) {
                        carousel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    transform: selectedMeal?.recipeId === meal.recipe.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: selectedMeal?.recipeId === meal.recipe.id ? '0 0 0 2px #228be6, 0 4px 12px rgba(0,0,0,0.1)' : undefined,
                    position: 'relative'
                  }}
                >
                  {selectedMeal?.recipeId === meal.recipe.id && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#228be6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      ✓
                    </div>
                  )}
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
                          variant="light"
                          color="blue"
                          leftSection={<IconVideo size={14} />}
                        >
                          Has Video
                        </Badge>
                      )}
                    </Group>
                    
                    <Button
                      variant="light"
                      fullWidth
                      color="blue"
                      leftSection={<IconChevronRight size={16} />}
                    >
                      View Recipe Steps
                    </Button>
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
      
      {/* Recipe Procedure Carousel with Video */}
      {selectedMeal && todaysMeals.length > 0 && (
        <Paper id="recipe-carousel" p="md" mt="xl" withBorder>
          <Stack spacing="xl">
            <Group position="apart">
              <Group>
                <IconChefHat size={24} color="var(--mantine-color-blue-6)" />
                <Title order={3}>Recipe Steps: {selectedMeal.recipeName}</Title>
              </Group>
            </Group>
            
            <Divider />
            
            {/* Video section */}
            {(() => {
              const recipe = getSelectedRecipe();
              const videoId = getYoutubeVideoId(recipe?.url);
              const timestamp = getCurrentStepTimestamp();
              
              // Generate a completely new URL each time reloadVideo changes
              // This forces the iframe to completely reload
              const videoKey = `video-${videoId}-${currentTimestamp}-${reloadVideo ? 'a' : 'b'}-${Date.now()}`;
              
              // YouTube embed parameters - use currentTimestamp instead of calculating it again
              const params = new URLSearchParams({
                start: currentTimestamp.toString(), // Use the state variable directly
                enablejsapi: '1',
                autoplay: '1',
                rel: '0',
                modestbranding: '1',
                controls: '1',
                showinfo: '0'
              }).toString();
              
              const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?${params}` : '';
              const watchUrl = videoId ? 
                `https://www.youtube.com/watch?v=${videoId}&t=${currentTimestamp}s` : '';
              
              // Debug info (removed problematic useEffect)
              console.log("Current timestamp in seconds:", currentTimestamp);
              console.log("Video embedding with URL:", embedUrl);
              
              return videoId ? (
                <Box mb="md">
                  <Box style={{ width: '100%', aspectRatio: '16/9' }}>
                    {/* The key prop is crucial - it forces React to completely recreate the iframe */}
                    <iframe
                      ref={youtubePlayerRef}
                      key={videoKey}
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </Box>
                  
                  {/* Timestamp info and direct link */}
                  <Group position="center" mt="xs">
                    <Text size="sm" c="dimmed">
                      Current timestamp: {timestamp || "None"}
                    </Text>
                    <Button 
                      compact
                      variant="subtle"
                      component="a"
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      leftSection={<IconExternalLink size={16} />}
                    >
                      Watch on YouTube
                    </Button>
                  </Group>
                </Box>
              ) : null;
            })()}
            
            {/* Carousel controls and content */}
            <Box style={{ position: 'relative', minHeight: '220px' }}>
              {/* Procedure step */}
              <Paper 
                p="xl" 
                withBorder 
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
              >
                <Stack align="center">
                  <Group spacing="md">
                    <Badge size="xl" color="blue" variant="filled" mb="md">
                      Step {currentStepIndex + 1} of {getSelectedRecipeProcedure().length}
                    </Badge>
                    
                    {(() => {
                      const timestamp = getCurrentStepTimestamp();
                      const recipe = getSelectedRecipe();
                      const videoId = getYoutubeVideoId(recipe?.url);
                      
                      return (timestamp && videoId) ? (
                        <Badge size="xl" color="orange" variant="filled" mb="md">
                          Video Timestamp: {timestamp}
                        </Badge>
                      ) : null;
                    })()}
                  </Group>
                  
                  <Text size="xl" fw={500} ta="center">
                    {(() => {
                      const step = getSelectedRecipeProcedure()[currentStepIndex];
                      if (!step) return "No steps available";
                      
                      // Remove "Step X: " prefix if present
                      const withoutStepPrefix = step.replace(/^Step\s+\d+\s*:\s*/i, '');
                      
                      // Remove any YouTube URLs
                      const withoutUrls = withoutStepPrefix.replace(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/g, '');
                      
                      // Remove any timestamps like 00:24, 1:45, etc.
                      const withoutTimestamps = withoutUrls.replace(/\d+:\d+(?::\d+)?/g, '');
                      
                      // Clean up any trailing punctuation, commas or extra spaces
                      const cleaned = withoutTimestamps.replace(/[,.]+\s*$/, '').trim().replace(/\s+/g, ' ');
                      
                      return cleaned || "No steps available";
                    })()}
                  </Text>
                </Stack>
                
                {/* Navigation buttons */}
                <Group style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                  <ActionIcon 
                    variant="filled" 
                    color="blue" 
                    size="xl" 
                    radius="xl"
                    onClick={handlePrevStep}
                    style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                    title="Previous Step"
                  >
                    <IconChevronLeft size={20} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="filled" 
                    color="blue" 
                    size="xl" 
                    radius="xl"
                    onClick={handleNextStep}
                    style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                    title="Next Step"
                  >
                    <IconChevronRight size={20} />
                  </ActionIcon>
                </Group>
              </Paper>
            </Box>
            
            {/* Step Navigation */}
            <Box mb="md">
              <Group mb="xs" position="apart">
                <Text fw={600}>Jump to Step:</Text>
                <Group spacing="xs">
                  <Badge color="orange" size="sm" leftSection={<IconVideo size={12} />}>
                    Has Video Timestamp
                  </Badge>
                  <Badge color="blue" size="sm">
                    No Timestamp
                  </Badge>
                </Group>
              </Group>
              
              <Group position="center" spacing="xs" style={{ flexWrap: 'wrap' }}>
                {getSelectedRecipeProcedure().map((_, idx) => {
                  const recipe = getSelectedRecipe();
                  const hasTimestamp = recipe?.timestamps?.some(t => t.step === idx + 1);
                  const timestamp = recipe?.timestamps?.find(t => t.step === idx + 1)?.timestamp;
                  
                  // Calculate timestamp in seconds for this step
                  const timestampSec = hasTimestamp && timestamp ? 
                    convertTimestampToSeconds(timestamp) : 0;
                  
                  return (
                    <Button
                      key={idx}
                      variant={currentStepIndex === idx ? "filled" : "light"}
                      color={hasTimestamp ? "orange" : "blue"}
                      compact
                      onClick={() => {
                        // Set the timestamp state directly here to ensure it updates
                        if (hasTimestamp && timestamp) {
                          setCurrentTimestamp(timestampSec);
                        }
                        
                        // Then navigate to the step which will trigger reload
                        navigateToStep(idx);
                        
                        console.log(`Navigating to step ${idx+1} with timestamp: ${timestamp} (${timestampSec}s)`);
                      }}
                      leftSection={hasTimestamp ? <IconVideo size={16} /> : null}
                      title={hasTimestamp ? `Step ${idx + 1} - Timestamp: ${timestamp}` : "No video timestamp for this step"}
                      style={{ 
                        position: 'relative',
                        ...(hasTimestamp ? {
                          overflow: 'visible'
                        } : {})
                      }}
                    >
                      {idx + 1}
                      {hasTimestamp && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'red',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </Group>
              
              <style>
                {`
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                `}
              </style>
            </Box>
            
            {/* Ingredients reference */}
            <Paper p="md" withBorder>
              <Group mb="md">
                <IconListDetails size={18} />
                <Text fw={700}>Recipe Ingredients:</Text>
              </Group>
              <List spacing="xs">
                {getSelectedRecipe()?.ingredients.map((ing, idx) => (
                  <List.Item key={idx}>
                    <Text span fw={500}>{ing.name}:</Text> {ing.quantity}
                  </List.Item>
                ))}
              </List>
            </Paper>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}