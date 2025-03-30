export interface Recipe {
  id: string;
  title: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  procedure: string[];
  youtubeUrl?: string;
  createdAt: Date;
  aiResponse?: string;
}