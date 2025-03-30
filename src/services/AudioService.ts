declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US'; // Default to English
    }
  }

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('Recording started');

      // Start speech recognition
      if (this.recognition) {
        this.recognition.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        resolve(audioFile);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording' || false;
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
} 