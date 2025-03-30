export class AudioExtractorService {
  private static readonly DB_NAME = 'audioCache';
  private static readonly STORE_NAME = 'audioFiles';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AudioExtractorService.DB_NAME, 1);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(AudioExtractorService.STORE_NAME)) {
          db.createObjectStore(AudioExtractorService.STORE_NAME);
        }
      };
    });
  }

  async extractAudioFromUrl(url: string): Promise<File> {
    try {
      console.log('\n=== Starting Audio Processing ===');
      console.log('URL:', url);

      // Check cache first
      const cachedAudio = await this.getFromIndexedDB(url);
      if (cachedAudio) {
        console.log('Audio found in cache');
        return cachedAudio;
      }

      // Extract video ID
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Use YouTube's audio stream URL
      const audioUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      console.log('Audio URL:', audioUrl);

      // Create an iframe to play the audio (this is a workaround since direct audio extraction isn't allowed)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = audioUrl;
      document.body.appendChild(iframe);

      // Return a placeholder file for now
      const audioFile = new File([], `${videoId}.mp3`, { type: 'audio/mpeg' });
      await this.saveToIndexedDB(url, audioFile);

      return audioFile;
    } catch (error) {
      console.error('Error extracting audio:', error);
      throw error;
    }
  }

  private async saveToIndexedDB(url: string, file: File): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AudioExtractorService.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(AudioExtractorService.STORE_NAME);
      const request = store.put(file, url);

      request.onsuccess = () => {
        console.log('Audio saved to IndexedDB:', url);
        resolve();
      };

      request.onerror = () => {
        console.error('Error saving to IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  private async getFromIndexedDB(url: string): Promise<File | null> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AudioExtractorService.STORE_NAME], 'readonly');
      const store = transaction.objectStore(AudioExtractorService.STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Error reading from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async playAudio(url: string): Promise<void> {
    try {
      console.log('\n=== Starting Audio Playback ===');
      console.log('URL:', url);

      const audioFile = await this.getFromIndexedDB(url);
      if (!audioFile) {
        throw new Error('Audio file not found in cache');
      }

      const audioUrl = URL.createObjectURL(audioFile);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        console.log('Audio playback completed');
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', error);
      };

      await audio.play();
      console.log('Audio playback started');
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  async getAudioUrl(url: string): Promise<string> {
    const audioFile = await this.getFromIndexedDB(url);
    if (!audioFile) {
      throw new Error('Audio file not found in cache');
    }
    return URL.createObjectURL(audioFile);
  }
} 