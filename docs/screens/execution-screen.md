# Execution Screen

The Execution Screen provides an interactive cooking guide, allowing users to follow recipe steps with synchronized video playback. It's designed for the active cooking experience.

## Features

1. **Recipe Step Navigation**
   - Step-by-step procedure carousel
   - Previous/next step buttons
   - Progress indicator

2. **YouTube Integration**
   - Embedded video player
   - Automatic timestamp synchronization
   - Manual video controls

3. **Auto-Sync Technology**
   - Video playback synchronized with recipe steps
   - Automatic step advancement based on timestamps
   - Toggle for auto-sync functionality

4. **UI Elements**
   - Clear step instructions
   - Ingredients list with quantities
   - Visual indications of current step
   - Recipe overview

## Implementation

### State Management

The Execution Screen uses the following state variables:

- `selectedMeal`: Currently selected meal for execution
- `currentStepIndex`: Index of the current procedure step
- `autoSync`: Boolean to enable/disable automatic step advancement
- `recipes`: Available recipes from cookbook
- `youtubePlayer`: Reference to the embedded YouTube player

### YouTube Player Integration

The screen integrates with YouTube using:
1. YouTube iframe API for embedding
2. Player controls for play, pause, and seeking
3. Event listeners for timestamp detection
4. URL parameter handling for video ID and timestamps

### Auto-Sync Logic

```typescript
const handleYoutubeTimeUpdate = (currentTime: number) => {
  if (!autoSync || !recipe?.timestamps) return;
  
  // Find the next step based on current video time
  const nextStep = recipe.timestamps.find(timestamp => {
    const timeInSeconds = parseTimestamp(timestamp.timestamp);
    return timeInSeconds > currentTime && timeInSeconds <= currentTime + 2;
  });
  
  if (nextStep) {
    navigateToStep(nextStep.step - 1);
  }
};
```

### Step Navigation

The step navigation system:
1. Tracks current step in state
2. Provides manual navigation buttons
3. Allows direct navigation to specific steps
4. Syncs steps with video when auto-sync is enabled

## UI Components

### Recipe Selection Component
```jsx
<Select
  label="Select a meal to cook"
  placeholder="Choose a recipe"
  data={todaysMeals.map(meal => ({
    value: meal.recipeId,
    label: `${meal.type}: ${getRecipeName(meal.recipeId)}`
  }))}
  value={selectedMeal?.recipeId}
  onChange={handleMealSelection}
/>
```

### Step Carousel Component
```jsx
<Carousel
  slideSize="100%"
  slideGap="md"
  withControls
  withIndicators
  loop={false}
  initialSlide={currentStepIndex}
  onSlideChange={setCurrentStepIndex}
>
  {recipe.procedure.map((step, index) => (
    <Carousel.Slide key={index}>
      <Paper p="xl" radius="md" withBorder>
        <Group position="apart" mb="md">
          <Badge size="lg" color="pumpkinOrange">Step {index + 1} of {recipe.procedure.length}</Badge>
          {timestamps && timestamps[index] && (
            <Badge
              component="a"
              href={timestamps[index].url}
              target="_blank"
              variant="tag"
            >
              <Group gap={4}>
                <IconClock size={14} />
                <Text size="xs">{timestamps[index].timestamp}</Text>
              </Group>
            </Badge>
          )}
        </Group>
        <Text size="lg">{step}</Text>
      </Paper>
    </Carousel.Slide>
  ))}
</Carousel>
```

### YouTube Player Component
```jsx
<div className="youtube-player-container">
  <YouTube
    videoId={youtubeVideoId}
    opts={{
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        start: currentTimestamp
      }
    }}
    onReady={handleYoutubeReady}
    onStateChange={handleYoutubeStateChange}
  />
  
  <Group mt="md">
    <Switch
      checked={autoSync}
      onChange={(event) => setAutoSync(event.currentTarget.checked)}
      label="Auto-sync steps with video"
    />
  </Group>
</div>
```

## Services Used

1. **RecipeService**: For fetching recipe details
2. **YouTube API**: For video embedding and control

## Data Flow

1. User selects a meal from today's planned meals
2. Recipe details and video are loaded
3. User navigates through steps manually or with auto-sync
4. Video playback is synchronized with step timestamps
5. User can toggle between manual and auto-sync modes

## Special Considerations

1. **Performance Optimization**
   - Efficient video loading and rendering
   - Step preloading for smooth transitions
   - Responsive video container

2. **User Experience**
   - Clear visual step progression
   - Intuitive controls during cooking
   - Offline availability of recipe steps

3. **Technical Considerations**
   - YouTube API integration and error handling
   - Timestamp parsing and normalization
   - Mobile-friendly interface for kitchen use