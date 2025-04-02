# 🍳 EasyCook - AI-Powered Recipe Assistant

EasyCook is a modern web application that helps you create, manage, and organize recipes using AI. It can extract recipes from YouTube cooking videos or process text descriptions, making it easy to build your personal digital cookbook.

## Features

- 🎥 **YouTube Video Integration**: Extract recipes directly from YouTube cooking videos with timestamp synchronization
- 🔄 **Step-by-Step Cooking Guide**: Follow recipe steps with integrated YouTube video playback
- 🎯 **Auto-Sync**: Carousel automatically advances to match video timestamps
- 🎤 **Voice Recording**: Record recipes by voice for quick and easy entry
- 🤖 **AI-Powered Recipe Parsing**: Convert text descriptions into structured recipes
- 🔥 **Firebase Integration**: Store recipes in the cloud and access from anywhere
- 🍽️ **Meal Planning**: Plan meals for specific dates with a visual calendar
- 🛒 **Grocery List**: Automatically generate shopping lists from planned meals
- 📱 **Modern UI**: Built with React and Mantine UI components
- 🏷️ **Tags & Categorization**: Organize recipes with customizable tags
- 🔍 **Search & Filter**: Easily find recipes in your cookbook
- ⭐ **Favorites**: Mark and filter your favorite recipes
- 👤 **User Authentication**: Secure login with Firebase Authentication

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **UI Library**: Mantine UI
- **State Management**: Zustand
- **AI Integration**: Google Gemini API and Vertex AI
- **Backend & Storage**: Firebase (Firestore, Authentication)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SaiVineethKS/easycook.git
   cd easycook
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_AI_API_TYPE=gemini
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Core Features

### 1. Recipe Creation & Management

- **Add from YouTube**: Extract complete recipes from cooking videos
- **Add from Text**: Convert plain text recipes into structured format
- **Voice Recording**: Record recipes by voice for hands-free entry
- **Edit & Delete**: Full control over your recipe collection
- **Custom Tags**: Organize with tags like "breakfast", "vegetarian", "quick & easy"

### 2. Video-Synchronized Cooking Guide

- **Step-by-Step Carousel**: Navigate through recipe steps with clear instructions
- **YouTube Integration**: Watch recipe videos synchronized with steps
- **Auto-Sync Technology**: Carousel automatically advances as video plays
- **Timestamp Navigation**: Jump to specific video sections for each step
- **Manual Navigation**: Also control steps manually with next/previous buttons

### 3. Meal Planning

- **Calendar View**: Plan meals for specific dates
- **Daily Meal Assignment**: Assign recipes to breakfast, lunch, or dinner
- **Servings Adjustment**: Specify number of servings for each planned meal

### 4. Grocery List Generation

- **Automatic List Creation**: Generate shopping lists from planned meals
- **Date Range Selection**: Choose specific date ranges for grocery lists
- **Item Categorization**: Automatically categorized by grocery department
- **Checklist Functionality**: Check off items as you shop

## Usage

### Adding Recipes from YouTube

1. Copy a YouTube URL of a cooking video
2. Paste it into the input field
3. Click "Add Recipe"
4. Review the AI-generated recipe with timestamps
5. Optionally add tags and adjust servings
6. Accept or reject the recipe

### Using the Cooking Execution Screen

1. Select a recipe from Today's Meals
2. Follow along with the step-by-step carousel
3. Watch the embedded YouTube video
4. Enable Auto-Sync to automatically advance steps with the video
5. Use step navigation to jump between different parts of the recipe

### Planning Meals

1. Navigate to the Planning screen
2. Select a date from the calendar
3. Assign recipes to breakfast, lunch, or dinner slots
4. Set the number of servings for each meal
5. Save your meal plan

### Generating Grocery Lists

1. Navigate to the Grocery List screen
2. Select a date range for your shopping
3. Choose which meals to include
4. View your automatically generated and categorized grocery list
5. Check items off as you shop

## Project Structure

```
easycook/
├── src/
│   ├── config/         # Firebase configuration
│   ├── contexts/       # React context providers
│   ├── screens/        # Main application screens
│   ├── services/       # API and service integrations
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   └── theme.ts        # UI theme configuration
├── public/             # Static assets
└── index.html          # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for providing the AI capabilities
- Firebase for backend and authentication services
- Mantine UI for the beautiful components
- The open-source community for various tools and libraries

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Recipe versioning and history
- [ ] Nutrition information extraction and display
- [ ] Recipe sharing and social features
- [ ] Voice command navigation during cooking
- [ ] Multi-language support
- [ ] Mobile app version