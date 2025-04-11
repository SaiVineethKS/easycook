import React, { useState, useEffect, useRef } from 'react';
import { Container, Title, TextInput, Button, Card, Text, Stack, Group, Grid, Paper, Badge, ActionIcon, Tooltip, Textarea, Loader, Alert, List, Divider, Collapse, Select, FileInput, Anchor, MultiSelect, Popover, NumberInput, Modal } from '@mantine/core';
import { IconTrash, IconEdit, IconPlus, IconVideo, IconBrain, IconAlertCircle, IconCheck, IconX, IconChevronRight, IconChevronDown, IconClock, IconMicrophone, IconMicrophoneOff, IconUpload, IconHeart, IconHeartFilled, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useStore } from '../store/useStore';
import { parseRecipe, parseRecipeFromAudio } from '../services/AIService';
import { AudioService } from '../services/AudioService';
import { useAuth } from '../contexts/AuthContext';
import { Recipe } from '../types/Recipe';

export const CookbookScreen = () => {
  const { user } = useAuth();
  const { 
    recipes, 
    fetchRecipes, 
    addRecipe, 
    deleteRecipe, 
    updateRecipe, 
    toggleFavorite,
    recipeProcessing,
    tempRecipeInput,
    error: storeError,
    analysisResult,  // Get the analysis result from the store
    startRecipeProcessing,
    setRecipeProcessingComplete,
    saveScreenState,
    getScreenState
  } = useStore();
  
  // Container ref for scroll position tracking
  const containerRef = useRef<HTMLDivElement>(null);
  // Throttle timer for scroll events
  const scrollThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get saved state from store
  const savedState = getScreenState('cookbook');
  
  const [recipeInput, setRecipeInput] = useState(savedState.recipeInput || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [expandedRecipes, setExpandedRecipes] = useState<string[]>(savedState.expandedRecipes || []);
  const [isRecording, setIsRecording] = useState(false);
  const audioServiceRef = useRef(new AudioService());
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(savedState.selectedTags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [servings, setServings] = useState(savedState.servings || 4);
  const [numberOfMeals, setNumberOfMeals] = useState(savedState.numberOfMeals || 1);
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
  // Servings and numberOfMeals now using saved state (defined above)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState<Recipe | null>(null);

  // Collection of health and fitness motivational quotes
  const healthQuotes = [
    { text: "Your health is an investment, not an expense.", author: "" },
    { text: "The only bad workout is the one that didn't happen.", author: "" },
    { text: "Healthy eating is a way of life, not a diet.", author: "" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison.", author: "Ann Wigmore" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "What you eat today walks and talks tomorrow.", author: "" },
    { text: "Your future self is watching you right now through memories.", author: "" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "The only limit to the height of your achievements is the reach of your dreams and your willingness to work for them.", author: "Michelle Obama" },
    { text: "Your health is what you make of it. Everything you do and think either adds to the vitality, energy, and spirit you possess or takes away from it.", author: "Ann Wigmore" },
    { text: "The only bad meal is the one you didn't enjoy.", author: "" },
    { text: "Cooking is like love. It should be entered into with abandon or not at all.", author: "Harriet Van Horne" },
    { text: "The only time to eat diet food is while you're waiting for the steak to cook.", author: "Julia Child" }
  ];

  // Function to get a random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * healthQuotes.length);
    setCurrentQuoteIndex(randomIndex);
    return healthQuotes[randomIndex];
  };

  // Change quote when recipe is analyzed
  useEffect(() => {
    if (currentRecipe) {
      getRandomQuote();
    }
  }, [currentRecipe]);

  // Change quote every 10 seconds with animation
  useEffect(() => {
    const intervalId = setInterval(() => {
      getRandomQuote();
    }, 10000); // 10 seconds

    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecipes(user.uid);
    }
  }, [user]);

  // Initialize from global state on component mount and when navigating back
  useEffect(() => {
    // Set recipe input from store if available
    if (tempRecipeInput) {
      setRecipeInput(tempRecipeInput);
    }
    
    // Set error from store if available
    if (storeError) {
      setError(storeError);
    }
  }, [tempRecipeInput, storeError]);
  
  // Update currentRecipe whenever analysisResult changes in the store
  useEffect(() => {
    if (analysisResult) {
      console.log('Analysis result available from store:', analysisResult.title);
      setCurrentRecipe(analysisResult);
      setLoading(false);
    }
  }, [analysisResult]);
  
  const handleAddRecipe = () => {
    if (!recipeInput.trim()) {
      setError("Please enter a recipe or YouTube URL");
      return;
    }
    
    try {
      // Set local loading state for UI feedback
      setLoading(true);
      setError(null);
      
      // Start global recipe processing - this enables cross-screen tracking
      startRecipeProcessing(recipeInput);
      
      // Use a background process for LLM querying
      (async () => {
        try {
          // Extract YouTube video ID if present - improved extraction logic
          const youtubeVideoId = (() => {
            try {
              if (!recipeInput.includes('youtube.com') && !recipeInput.includes('youtu.be')) return null;
              
              // Standard YouTube URL (youtube.com/watch?v=VIDEO_ID)
              if (recipeInput.includes('youtube.com/watch')) {
                const urlObj = new URL(recipeInput);
                return urlObj.searchParams.get('v');
              } 
              // Short YouTube URL (youtu.be/VIDEO_ID)
              else if (recipeInput.includes('youtu.be/')) {
                const parts = recipeInput.split('youtu.be/');
                if (parts.length > 1) {
                  // Remove any query parameters
                  return parts[1].split(/[?&#]/)[0];
                }
              }
              // YouTube embed URL (youtube.com/embed/VIDEO_ID)
              else if (recipeInput.includes('youtube.com/embed/')) {
                const parts = recipeInput.split('youtube.com/embed/');
                if (parts.length > 1) {
                  return parts[1].split(/[?&#]/)[0];
                }
              }
              return null;
            } catch (error) {
              console.error('Error extracting YouTube video ID:', error);
              return null;
            }
          })();
          
          console.log('Extracted YouTube video ID:', youtubeVideoId);
          
          // Call LLM API - this may take time but now runs in background
          const parsedRecipe = await parseRecipe(recipeInput);
          
          // Process timestamps to use the correct format
          const processedTimestamps = parsedRecipe.timestamps?.map(timestamp => {
            // Convert timestamp to seconds (e.g., "1:30" to 90 seconds)
            const timeInSeconds = (() => {
              if (!timestamp.timestamp) return 0;
              
              const parts = timestamp.timestamp.split(':');
              if (parts.length === 2) {
                // Format: MM:SS
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
              } else if (parts.length === 3) {
                // Format: HH:MM:SS
                return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
              }
              return 0;
            })();
            
            // Create the correct YouTube URL with timestamp
            const videoUrl = youtubeVideoId 
              ? `https://www.youtube.com/watch?v=${youtubeVideoId}&t=${timeInSeconds}s`
              : '';
            
            return {
              ...timestamp,
              url: videoUrl,
              date: new Date().toISOString().split('T')[0] // Add today's date in YYYY-MM-DD format
            };
          }) || [];
          
          // Set YouTube URL and thumbnail if a YouTube video ID was found
          const isYouTube = recipeInput.includes('youtube.com') || recipeInput.includes('youtu.be');
          const youtubeUrl = youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : '';
          const thumbnailUrl = youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg` : '';
          
          console.log('Setting thumbnail URL:', thumbnailUrl);
          
          const newRecipe = {
            id: crypto.randomUUID(),
            title: parsedRecipe.title,
            ingredients: parsedRecipe.ingredients,
            procedure: parsedRecipe.procedure,
            suggestedTags: parsedRecipe.suggestedTags,
            servings,
            numberOfMeals,
            aiResponse: parsedRecipe.aiResponse,
            url: isYouTube ? youtubeUrl : '',
            thumbnailUrl: thumbnailUrl,
            createdAt: new Date(),
            metadata: {
              source: isYouTube ? 'youtube' : 'text',
              processingDate: new Date(),
              videoId: youtubeVideoId || undefined
            },
            timestamps: processedTimestamps
          };

          // Store result in global state and mark processing as complete
          setRecipeProcessingComplete(newRecipe);
          
          // Also update local state if we're still on this screen
          setCurrentRecipe(newRecipe);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          console.error('Error in background processing:', errorMessage);
          
          // Update global state with the error
          setRecipeProcessingComplete(null, errorMessage);
          
          // Also update local state if we're still on this screen
          setError(errorMessage);
        } finally {
          // Clear local loading state
          setLoading(false);
        }
      })();
      
      // Return immediately while processing continues in the background
      // This allows navigation to other screens
    } catch (error) {
      // Handle any synchronous errors
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLoading(false);
      setRecipeProcessingComplete(null, error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleAcceptRecipe = async () => {
    if (!currentRecipe || !user) return;

    try {
      const recipeToAdd: Recipe = {
        id: Date.now().toString(),
        title: currentRecipe.title,
        ingredients: currentRecipe.ingredients,
        procedure: currentRecipe.procedure,
        servings: servings,
        numberOfMeals: numberOfMeals,
        tags: selectedTags,
        isFavorite: false,
        url: currentRecipe.url || '',
        thumbnailUrl: currentRecipe.thumbnailUrl || '',
        userId: user.uid,
        timestamps: currentRecipe.timestamps || [],
        metadata: {
          source: currentRecipe.metadata?.source || 'text',
          processingDate: new Date(),
          // Only include videoId if it exists, to avoid Firebase undefined field error
          ...(currentRecipe.metadata?.videoId ? { videoId: currentRecipe.metadata.videoId } : {})
        }
      };

      console.log('Adding recipe to Firebase:', recipeToAdd);
      await addRecipe(recipeToAdd);
      console.log('Recipe successfully added to Firebase');
      
      // Clear both local and global state
      setRecipeProcessingComplete(null);
      setCurrentRecipe(null);
      setRecipeInput('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Error accepting recipe:', error);
      setError('Failed to save recipe to database');
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

  const handleStopRecording = () => {
    try {
      // Set local loading state for UI feedback
      setLoading(true);
      setError(null);
      
      // Set the recording state early for UI responsiveness
      setIsRecording(false);
      
      // Store the recording state globally - this enables cross-screen tracking
      startRecipeProcessing('audio-recording');
      
      // Use a background process for audio processing and LLM querying
      (async () => {
        try {
          // Get the audio file
          const audioFile = await audioServiceRef.current.stopRecording();
          
          // Call LLM API with audio - this may take time but now runs in background
          const parsedRecipe = await parseRecipeFromAudio(audioFile);
          
          // Check if the recipe mentions a YouTube video - improved extraction
          const youtubeMatch = parsedRecipe.aiResponse?.match(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^\s&]+)/i);
          
          // Extract video ID with better handling
          let videoId = null;
          if (youtubeMatch) {
            // Get the raw match
            videoId = youtubeMatch[3];
            // Clean up the video ID by removing any trailing characters after ? or &
            videoId = videoId.split(/[?&#]/)[0];
            console.log('Found YouTube video ID in audio response:', videoId);
          }
          
          // Create both thumbnail and video URLs
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
          const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
          
          // Process any timestamps and add today's date to each for Today's meals section
          const processedTimestamps = parsedRecipe.timestamps?.map(timestamp => ({
            ...timestamp,
            url: videoId ? `https://www.youtube.com/watch?v=${videoId}&t=0s` : '',
            date: new Date().toISOString().split('T')[0] // Add today's date in YYYY-MM-DD format
          })) || [];
          
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
            url: youtubeUrl,
            thumbnailUrl: thumbnailUrl || '',
            metadata: {
              source: 'audio',
              processingDate: new Date(),
              videoId: videoId || undefined
            },
            timestamps: processedTimestamps
          };
          
          // Store result in global state and mark processing as complete
          setRecipeProcessingComplete(newRecipe);
          
          // Also update local state if we're still on this screen
          setCurrentRecipe(newRecipe);
        } catch (error) {
          console.error('Error processing recording:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to process recording';
          
          // Update global state with the error
          setRecipeProcessingComplete(null, errorMessage);
          
          // Also update local state if we're still on this screen
          setError(errorMessage);
        } finally {
          // Clear local loading state
          setLoading(false);
        }
      })();
      
      // Return immediately while processing continues in the background
      // This allows navigation to other screens
    } catch (error) {
      // Handle any synchronous errors
      console.error('Error stopping recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process recording';
      setError(errorMessage);
      setRecipeProcessingComplete(null, errorMessage);
      setIsRecording(false);
      setLoading(false);
    }
  };

  const handleAudioUpload = (file: File | null) => {
    if (!file) return;
    
    try {
      // Set local loading state for UI feedback
      setLoading(true);
      setError(null);
      setAudioFile(file);
      
      // Store the file upload state globally - this enables cross-screen tracking
      startRecipeProcessing(`audio-upload: ${file.name}`);
      
      // Use a background process for audio processing and LLM querying
      (async () => {
        try {
          // Call LLM API with audio file - this may take time but now runs in background
          const parsedRecipe = await parseRecipeFromAudio(file);
          
          // Check if the recipe mentions a YouTube video - improved extraction
          const youtubeMatch = parsedRecipe.aiResponse?.match(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^\s&]+)/i);
          
          // Extract video ID with better handling
          let videoId = null;
          if (youtubeMatch) {
            // Get the raw match
            videoId = youtubeMatch[3];
            // Clean up the video ID by removing any trailing characters after ? or &
            videoId = videoId.split(/[?&#]/)[0];
            console.log('Found YouTube video ID in audio file upload:', videoId);
          }
          
          // Create both thumbnail and video URLs
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
          const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
          
          // Process any timestamps and add today's date to each for Today's meals section
          const processedTimestamps = parsedRecipe.timestamps?.map(timestamp => ({
            ...timestamp,
            url: videoId ? `https://www.youtube.com/watch?v=${videoId}&t=0s` : '',
            date: new Date().toISOString().split('T')[0] // Add today's date in YYYY-MM-DD format
          })) || [];
          
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
            url: youtubeUrl,
            thumbnailUrl: thumbnailUrl || '',
            metadata: {
              source: 'audio',
              processingDate: new Date(),
              videoId: videoId || undefined
            },
            timestamps: processedTimestamps
          };
          
          // Store result in global state and mark processing as complete
          setRecipeProcessingComplete(newRecipe);
          
          // Also update local state if we're still on this screen
          setCurrentRecipe(newRecipe);
        } catch (error) {
          console.error('Error processing audio:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to process audio file';
          
          // Update global state with the error
          setRecipeProcessingComplete(null, errorMessage);
          
          // Also update local state if we're still on this screen
          setError(errorMessage);
        } finally {
          // Clear local loading state
          setLoading(false);
        }
      })();
      
      // Return immediately while processing continues in the background
      // This allows navigation to other screens
    } catch (error) {
      // Handle any synchronous errors
      console.error('Error processing audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process audio file';
      setError(errorMessage);
      setRecipeProcessingComplete(null, errorMessage);
      setLoading(false);
    }
  };

  const handleRejectRecipe = () => {
    // Clear both local and global state
    setCurrentRecipe(null);
    setRecipeProcessingComplete(null);
    setRecipeInput('');
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

  const updateServings = (index: number, value: number) => {
    if (!user) return;
    const recipe = recipes[index];
    updateRecipe(recipe.id, user.uid, { servings: value });
  };

  const updateNumberOfMeals = (index: number, value: number) => {
    if (!user) return;
    const recipe = recipes[index];
    updateRecipe(recipe.id, user.uid, { numberOfMeals: value });
  };

  const handleDelete = async (index: number) => {
    if (!user) return;
    
    try {
      const recipe = recipes[index];
      await deleteRecipe(recipe.id, user.uid);
      setDeleteConfirmIndex(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError('Failed to delete recipe');
    }
  };

  const RecipeDetails: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="lg" fw={500}>{recipe.title}</Text>
          <Group>
            <ActionIcon 
              onClick={() => toggleFavorite(recipe.id)}
              color={recipe.isFavorite ? 'yellow' : 'gray'}
            >
              {recipe.isFavorite ? <IconStarFilled size={20} /> : <IconStar size={20} />}
            </ActionIcon>
            <ActionIcon color="red" onClick={() => deleteRecipe(recipe.id)}>
              <IconTrash size={20} />
            </ActionIcon>
          </Group>
        </Group>
        
        {recipe.tags && recipe.tags.length > 0 && (
          <Group gap="xs">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="tag">
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        <Button 
          variant="subtle" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>

        {isExpanded && (
          <>
            <Text fw={500}>Ingredients:</Text>
            <Stack gap="xs">
              {recipe.ingredients.map((ingredient, index) => (
                <Text key={index}>
                  • {ingredient.quantity} {ingredient.name}
                </Text>
              ))}
            </Stack>

            <Text fw={500}>Procedure:</Text>
            <Stack gap="xs">
              {recipe.procedure.map((step, index) => (
                <Text key={index}>
                  {index + 1}. {step}
                </Text>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    );
  };

  // State persistence - Save to store whenever relevant state changes
  useEffect(() => {
    saveScreenState('cookbook', {
      recipeInput,
      selectedTags,
      servings,
      numberOfMeals,
      expandedRecipes
    });
  }, [recipeInput, selectedTags, servings, numberOfMeals, expandedRecipes, saveScreenState]);

  // Scroll position restoration on mount
  useEffect(() => {
    if (containerRef.current && savedState.scrollPosition) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = savedState.scrollPosition;
        }
      }, 100); // Short delay to ensure content is rendered
    }
  }, [savedState.scrollPosition]);

  // Scroll position tracking with throttling to prevent glitching
  const handleScroll = () => {
    // Skip if already waiting for a throttle timer
    if (scrollThrottleTimerRef.current) return;
    
    // Set a throttle timer of 100ms
    scrollThrottleTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        saveScreenState('cookbook', {
          scrollPosition: containerRef.current.scrollTop
        });
      }
      // Clear the throttle timer
      scrollThrottleTimerRef.current = null;
    }, 100);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any pending throttle timer
      if (scrollThrottleTimerRef.current) {
        clearTimeout(scrollThrottleTimerRef.current);
      }
      
      // Save final state before unmounting
      if (containerRef.current) {
        saveScreenState('cookbook', {
          scrollPosition: containerRef.current.scrollTop
        });
      }
      
      if (isRecording) {
        audioServiceRef.current.stopRecording().catch(console.error);
      }
    };
  }, [isRecording, saveScreenState]);


  return (
    <Container 
      size="lg" 
      py="xl" 
      ref={containerRef}
      onScroll={handleScroll}
      style={{ 
        minHeight: '100vh',  // Use minHeight instead of fixed height
        position: 'relative', // Keep position context
        overflowX: 'hidden'  // Only hide horizontal overflow
      }}>
      <Stack gap="md" mb="xl">
        <Paper p="xl" radius="md" bg="var(--mantine-color-blue-0)" style={{ border: 'none' }}>
          <Stack gap="xs" align="center">
            <Text 
              size="xl" 
              fw={700} 
              ta="center" 
              style={{ 
                fontFamily: 'Georgia, serif',
                lineHeight: 1.4,
                maxWidth: '800px',
                transition: 'opacity 0.5s ease-in-out',
                opacity: 1
              }}
              key={currentQuoteIndex}
            >
              "{healthQuotes[currentQuoteIndex].text}"
            </Text>
            {healthQuotes[currentQuoteIndex].author && (
              <Text size="sm" c="#5b4f3f" ta="center" mt="xs" fw={500}>
                — {healthQuotes[currentQuoteIndex].author}
              </Text>
            )}
          </Stack>
        </Paper>
      </Stack>
      
      <Card shadow="sm" mb="xl">
        <Stack gap="md">
          <Group>
            <TextInput
              placeholder="Enter your recipe or paste a YouTube URL"
              value={recipeInput}
              onChange={(e) => setRecipeInput(e.target.value)}
              style={{ flex: 1 }}
              disabled={loading}
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

          {recipeProcessing && (
            <Alert icon={<IconBrain size={16} />} title="Processing Recipe" color="blue">
              <Stack gap="xs">
                <Text size="sm">Our AI is analyzing your recipe. This may take up to 15-30 seconds...</Text>
                <Group>
                  <Loader size="sm" />
                  <Text size="sm" fw={500} c="blue.7">Feel free to navigate to other screens - your recipe will be processed in the background</Text>
                </Group>
                <Group gap="xs" mt="xs">
                  <Badge color="herbGreen" variant="filled" size="lg">
                    <Group gap={6}>
                      <IconCheck size={14} />
                      <Text size="xs" fw={600}>Background Processing Active</Text>
                    </Group>
                  </Badge>
                </Group>
                <Text size="sm" mt="xs">When you return, your recipe will appear here automatically.</Text>
              </Stack>
            </Alert>
          )}

          {currentRecipe && (
            <Paper shadow="sm" p="lg" radius="md" withBorder>
              <Stack gap="lg">
                <Group>
                  <IconBrain size={24} color="var(--mantine-color-blue-6)" />
                  <Title order={3} fw={700}>{currentRecipe.title}</Title>
                </Group>
                
                <div>
                  <Text fw={600} size="sm" c="#5b4f3f" mb="xs">Ingredients:</Text>
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
                  <Text fw={600} size="sm" c="#5b4f3f" mb="xs">Procedure:</Text>
                  <List type="ordered" spacing="xs">
                    {currentRecipe.procedure.map((step, index) => {
                      const timestamp = currentRecipe.timestamps?.find(t => t.step === index + 1);
                      return (
                        <List.Item key={index}>
                          <Group align="flex-start" wrap="nowrap">
                            <Text size="sm" style={{ flex: 1 }}>{step.replace(`Step ${index + 1}: `, '')}</Text>
                            {timestamp && timestamp.url && (
                              <Badge 
                                color="tagBlue" 
                                variant="light"
                                component="a"
                                href={timestamp.url}
                                target="_blank"
                                style={{ 
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                              >
                                <Group gap={4}>
                                  <IconClock size={12} />
                                  <Text size="xs">{timestamp.timestamp}</Text>
                                </Group>
                              </Badge>
                            )}
                          </Group>
                        </List.Item>
                      );
                    })}
                  </List>
                </div>

                {/* Recipe Tags Section */}
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Recipe Tags</Text>
                  <Text size="xs" c="#5b4f3f" fw={500}>Auto-selected tags based on recipe content. Click to toggle.</Text>
                  
                  <Group gap="xs">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        size="lg"
                        variant={selectedTags.includes(tag) ? "tag" : "filled"}
                        color={selectedTags.includes(tag) ? undefined : "warmNeutral"}
                        onClick={() => toggleTag(tag)}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          ...(selectedTags.includes(tag) ? {} : {
                            backgroundColor: 'rgba(91, 79, 63, 0.15)',
                            color: '#5b4f3f',
                            fontWeight: 600
                          })
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
                          color="blue"
                          variant="dot"
                          onClick={() => setIsAddingTag(true)}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
              </Stack>
              <Group justify="flex-end" mt="md">
                <Button
                  color="green"
                  onClick={handleAcceptRecipe}
                  leftSection={<IconCheck size={20} />}
                >
                  Accept
                </Button>
                <Button
                  color="red"
                  onClick={() => {
                    setRecipeProcessingComplete(null);
                    setCurrentRecipe(null);
                    setRecipeInput('');
                  }}
                  leftSection={<IconX size={20} />}
                >
                  Reject
                </Button>
              </Group>
            </Paper>
          )}


          {/* Only show the Add Recipe button when not in any processing state and no recipe is currently displayed */}
          {!currentRecipe && !recipeProcessing && !loading && (
            <Button 
              onClick={() => {
                if (user) {
                  handleAddRecipe();
                }
              }}
              disabled={!recipeInput || isRecording}
              leftSection={<IconPlus size={16} />}
              fullWidth
              variant="filled"
            >
              Add Recipe
            </Button>
          )}
          
          {/* Show loading button when in local loading state */}
          {!currentRecipe && !recipeProcessing && loading && (
            <Button 
              disabled={true}
              leftSection={<Loader size="xs" />}
              fullWidth
              variant="filled"
            >
              Processing...
            </Button>
          )}
        </Stack>
      </Card>

      <Grid gutter="lg">
        {recipes.map((recipe, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
            <Paper 
              shadow="md"
              p={0}
              data-recipe-card
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease',
                border: '1px solid var(--mantine-color-gray-2)'
              }}
            >
              {/* Netflix-style thumbnail at the top */}
              {/* Recipe Thumbnail Section */}
              {recipe.metadata?.videoId || recipe.thumbnailUrl ? (
                <div style={{
                  width: '100%',
                  height: '180px',
                  position: 'relative',
                }}>
                  {/* Try multiple thumbnail sources if one fails */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${
                        // Try maxresdefault first
                        recipe.thumbnailUrl || 
                        // If that's not set, try to create from videoId
                        (recipe.metadata?.videoId ? 
                          `https://img.youtube.com/vi/${recipe.metadata.videoId}/maxresdefault.jpg` : 
                          // If nothing exists, use a blank gradient
                          'linear-gradient(to bottom, #f0f0f0, #e0e0e0)')
                      })`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                    // Add error handling to try fallback image
                    onError={(e) => {
                      if (recipe.metadata?.videoId) {
                        // If maxresdefault fails, try the more reliable hqdefault
                        (e.target as HTMLElement).style.backgroundImage = 
                          `url(https://img.youtube.com/vi/${recipe.metadata.videoId}/hqdefault.jpg)`;
                      }
                    }}
                  />
                  
                  {/* Overlay gradient */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))',
                    zIndex: 1
                  }} />
                  
                  {/* Favorite button on thumbnail */}
                  <ActionIcon
                    variant="filled"
                    color={recipe.isFavorite ? "yellow" : "gray"}
                    onClick={() => toggleFavorite(recipe.id)}
                    aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    size="lg"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {recipe.isFavorite ? (
                      <IconStarFilled size={22} />
                    ) : (
                      <IconStar size={22} />
                    )}
                  </ActionIcon>
                </div>
              ) : (
                // If no thumbnail, just add minimal spacing
                <div style={{ height: '24px' }} />
              )}
              
              <Stack gap="md" p="lg">
                <Group position="apart" align="flex-start">
                  <Title 
                    order={3} 
                    fw={700}
                    style={{ 
                      lineHeight: 1.3,
                      marginBottom: '8px',
                      flex: 1
                    }}
                  >
                    {recipe.title}
                  </Title>
                
                  <Group gap="xs">
                    <Tooltip label="Edit Recipe">
                      <ActionIcon 
                        variant="subtle" 
                        size="md"
                        color="blue"
                        onClick={() => setEditingIndex(index)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Recipe">
                      <ActionIcon 
                        variant="subtle" 
                        color="red" 
                        size="md"
                        onClick={() => setDeleteConfirmIndex(index)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
                
                <Divider my="xs" />

                {recipe.tags && recipe.tags.length > 0 && (
                  <Group gap="xs" wrap="wrap">
                    {recipe.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="tag">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                )}


                {recipe.url && recipe.url.includes('youtube') && (
                  <Button 
                    component="a"
                    href={recipe.url}
                    target="_blank"
                    color="red"
                    variant="filled"
                    fullWidth
                    leftSection={<IconVideo size={18} />}
                    style={{ 
                      fontWeight: 600
                    }}
                  >
                    Watch on YouTube
                  </Button>
                )}

                <Collapse in={expandedRecipes.includes(index.toString())}>
                  <Stack gap="md" mt="md" mb="md">
                    <Text fw={600} size="md">Ingredients:</Text>
                    <List spacing="xs">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <List.Item key={idx}>
                          <Text size="sm">
                            <Text span fw={500}>{ingredient.name}:</Text> {ingredient.quantity}
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                    
                    <Text fw={600} size="md">Procedure:</Text>
                    <List type="ordered" spacing="xs">
                      {recipe.procedure.map((step, idx) => (
                        <List.Item key={idx}>
                          <Text size="sm">{step.replace(`Step ${idx + 1}: `, '')}</Text>
                        </List.Item>
                      ))}
                    </List>
                  </Stack>
                </Collapse>

                <Group position="apart" my="md">
                  <Group>
                    <Badge color="tagBlue" size="md" radius="sm" variant="filled">
                      <Group gap={4}>
                        <Text size="xs" fw={500}>Serves {recipe.servings}</Text>
                      </Group>
                    </Badge>
                    
                    <Badge color="grape" size="md" radius="sm" variant="filled">
                      <Group gap={4}>
                        <Text size="xs" fw={500}>{recipe.numberOfMeals} meal{recipe.numberOfMeals > 1 ? 's' : ''}</Text>
                      </Group>
                    </Badge>
                  </Group>
                  
                  <Badge color="warmNeutral" size="md" radius="sm" variant="filled">
                    <Group gap={4}>
                      <IconClock size={12} /> 
                      <Text size="xs" fw={600}>{new Date(recipe.metadata?.processingDate || new Date()).toLocaleDateString()}</Text>
                    </Group>
                  </Badge>
                </Group>

                <Button 
                  variant={expandedRecipes.includes(index.toString()) ? "light" : "outline"}
                  color="blue"
                  onClick={() => toggleRecipeExpansion(index.toString())} 
                  fullWidth
                  mt={recipe.url && recipe.url.includes('youtube') ? "xs" : "md"}
                  leftSection={expandedRecipes.includes(index.toString()) ? 
                    <IconChevronDown size={16} /> : 
                    <IconChevronRight size={16} />
                  }
                >
                  {expandedRecipes.includes(index.toString()) ? 'Hide Recipe Details' : 'View Recipe Details'}
                </Button>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

      <Modal
        opened={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        title="Delete Recipe"
        size="sm"
      >
        <Stack>
          <Text>Are you sure you want to delete "{recipes[deleteConfirmIndex!]?.title}"?</Text>
          <Group justify="flex-end">
            <Button 
              variant="light" 
              onClick={() => setDeleteConfirmIndex(null)}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => handleDelete(deleteConfirmIndex!)}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};