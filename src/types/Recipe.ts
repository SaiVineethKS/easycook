export interface Recipe {
  id: string;
  title: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  procedure: string[];
  servings: number;
  numberOfMeals: number;
  tags?: string[];
  isFavorite?: boolean;
  url?: string;
  thumbnailUrl?: string;
  aiResponse?: string;
  userId?: string;
  createdAt?: Date | string;
  suggestedTags?: string[];
  timestamps?: {
    step: number;
    timestamp: string;
    url?: string;
    date?: string; // Date when this timestamp was created (formatted as ISO string)
  }[];
  metadata?: {
    source: 'youtube' | 'text' | 'audio';
    originalInput?: string;
    processingDate: Date;
    videoId?: string;
  };
}