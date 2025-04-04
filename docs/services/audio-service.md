# Audio Service

The Audio Service provides voice recording capabilities for the EasyCook application, enabling users to create recipes by dictation.

## Features

1. **Voice Recording**
   - Browser-based audio capture
   - Start/stop recording controls
   - Audio format handling

2. **Audio Processing**
   - Audio blob creation
   - File conversion for AI processing
   - Buffer handling

3. **Error Management**
   - Permission handling
   - Device compatibility checks
   - Error reporting

## Implementation

### Web Audio API Integration

The service uses the Web Audio API for recording:

```typescript
export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Unable to access microphone. Please check permissions.');
    }
  }

  async stopRecording(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording found.'));
        return;
      }

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        
        // Stop all audio tracks to release the microphone
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioFile);
      });

      this.mediaRecorder.stop();
    });
  }
}
```

### Key Methods

#### `startRecording(): Promise<void>`

- Requests microphone access permission
- Initializes MediaRecorder with audio stream
- Sets up event listeners for audio chunks
- Begins recording process

#### `stopRecording(): Promise<File>`

- Stops the active recording
- Combines audio chunks into a single blob
- Creates a File object from the blob
- Releases microphone access
- Returns the audio file for processing

## Error Handling

The service handles several potential errors:

1. Permission denied errors (user refuses microphone access)
2. Device compatibility issues (no microphone available)
3. Recording state errors (stopping without starting)
4. Browser support limitations

## Integration Points

### With CookbookScreen
- Recording controls in the recipe input section
- Visual feedback during recording
- Error messaging for recording issues

### With AIService
- Audio files are passed to AIService for processing
- Transcription and recipe extraction handled by AI

## Browser Compatibility

The service is compatible with modern browsers that support:
- MediaDevices API
- MediaRecorder API
- Blob and File APIs

For older browsers, appropriate fallback messages are displayed.

## Usage Example

```typescript
import { AudioService } from '../services/AudioService';

// In a component
const audioServiceRef = useRef(new AudioService());
const [isRecording, setIsRecording] = useState(false);

const handleStartRecording = async () => {
  try {
    await audioServiceRef.current.startRecording();
    setIsRecording(true);
  } catch (error) {
    console.error('Error starting recording:', error);
    // Show error message
  }
};

const handleStopRecording = async () => {
  try {
    setIsRecording(false);
    const audioFile = await audioServiceRef.current.stopRecording();
    // Process the audio file
    const parsedRecipe = await parseRecipeFromAudio(audioFile);
    // Update UI with the result
  } catch (error) {
    console.error('Error stopping recording:', error);
    // Show error message
  }
};
```

## Special Considerations

1. **Privacy**
   - Clear visual indicators during recording
   - Explicit permission requests
   - No persistent storage of raw audio

2. **User Experience**
   - Microphone level visualization (optional)
   - Clear recording status feedback
   - Graceful error handling with helpful messages

3. **Mobile Support**
   - Touch interface optimizations
   - Media constraints for mobile devices
   - Background recording considerations