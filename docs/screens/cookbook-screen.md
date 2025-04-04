# Cookbook Screen

The Cookbook Screen is the primary interface for recipe management in the EasyCook application. It serves as the landing page after login and provides features for creating, viewing, and managing recipes.

## Features

1. **Recipe Creation**
   - Text input for recipe description
   - YouTube URL input for video recipes
   - Voice recording for hands-free entry
   - Audio file upload for recipe processing

2. **Recipe Management**
   - List of saved recipes with thumbnail previews
   - Recipe details with ingredients and procedures
   - Recipe tags for organization
   - Favorites functionality
   - Recipe deletion

3. **AI Integration**
   - Automatic parsing of recipe text
   - YouTube video processing with timestamp extraction
   - Voice-to-text processing

4. **UI Elements**
   - Recipe cards with visual thumbnails
   - Expandable recipe details
   - Tag selection and creation
   - Motivational quotes carousel

## Implementation

### State Management

The Cookbook Screen uses the following state variables:

- `recipes`: List of all user recipes (from Zustand store)
- `recipeInput`: Current input text for recipe creation
- `loading`: Loading state during recipe processing
- `error`: Error messages during recipe processing
- `currentRecipe`: Currently displayed recipe result
- `expandedRecipes`: List of recipe IDs that are expanded
- `isRecording`: Voice recording status
- `selectedTags`: Tags selected for the current recipe
- `servings` & `numberOfMeals`: Recipe configuration

### AI Processing Logic

Recipe processing follows this flow:

1. User enters text, URL, or records audio
2. `handleAddRecipe`, `handleStopRecording`, or `handleAudioUpload` triggered
3. UI shows loading state and starts background processing
4. AI service processes input (uses Gemini or Vertex AI)
5. Result is displayed as `currentRecipe` for user review
6. User can accept or reject the processed recipe

### YouTube Integration

For YouTube recipes:
- URL is parsed to extract video ID
- Thumbnails are fetched from YouTube
- Timestamps are extracted and converted to proper format
- Video embedding is set up for the Execution Screen

### Recipe Cards

Recipe cards include:
- Image thumbnail for videos
- Title and tags
- Favorite button
- Serving and meal count
- Expandable sections for ingredients and procedure
- YouTube link for video recipes

## UI Components

### Recipe Input Section
```jsx
<Card shadow="sm" mb="xl">
  <Stack gap="md">
    <TextInput
      placeholder="Enter your recipe or paste a YouTube URL"
      value={recipeInput}
      onChange={(e) => setRecipeInput(e.target.value)}
    />
    <ActionIcon
      variant="light"
      color={isRecording ? "red" : "blue"}
      onClick={isRecording ? handleStopRecording : handleStartRecording}
    >
      {isRecording ? <IconMicrophoneOff /> : <IconMicrophone />}
    </ActionIcon>
    <Button onClick={handleAddRecipe}>Add Recipe</Button>
  </Stack>
</Card>
```

### Recipe Card Component
```jsx
<Paper shadow="md" p={0} data-recipe-card>
  {/* Thumbnail Section */}
  <div style={{backgroundImage: `url(${recipe.thumbnailUrl})`}}></div>
  
  <Stack gap="md" p="lg">
    <Group position="apart">
      <Title order={3}>{recipe.title}</Title>
      <ActionIcon onClick={() => toggleFavorite(recipe.id)}>
        {recipe.isFavorite ? <IconStarFilled /> : <IconStar />}
      </ActionIcon>
    </Group>
    
    {/* Tags Section */}
    <Group>
      {recipe.tags?.map(tag => (
        <Badge variant="tag" key={tag}>{tag}</Badge>
      ))}
    </Group>
    
    {/* Expandable Content */}
    <Collapse in={expandedRecipes.includes(recipe.id)}>
      {/* Ingredients and Procedure */}
    </Collapse>
    
    <Button onClick={() => toggleRecipeExpansion(recipe.id)}>
      {expandedRecipes.includes(recipe.id) ? 'Hide Details' : 'View Details'}
    </Button>
  </Stack>
</Paper>
```

## Services Used

1. **AIService**: For recipe parsing (text and audio)
2. **AudioService**: For voice recording functionality
3. **RecipeService**: For Firebase operations (add, update, delete recipes)

## Data Flow

1. User enters recipe information
2. AI processing converts raw input to structured Recipe object
3. User reviews and optionally edits recipe
4. Recipe is saved to Firebase via RecipeService
5. UI is updated with the new recipe in the list

## Special Considerations

1. **Performance Optimization**
   - Background processing for AI operations
   - State persistence for screen position and expansions
   - Image lazy loading for recipe thumbnails

2. **Error Handling**
   - Graceful fallbacks for missing thumbnails
   - Clear error messaging for AI processing failures
   - Local state updates even if Firebase operations fail

3. **Accessibility**
   - Voice input for hands-free operation
   - Clear visual hierarchy and contrast
   - Responsive layout for different screen sizes