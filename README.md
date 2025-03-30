# 🍳 EasyCook - AI-Powered Recipe Assistant

EasyCook is a modern web application that helps you create, manage, and organize recipes using AI. It can extract recipes from YouTube cooking videos or process text descriptions, making it easy to build your personal digital cookbook.

## Features

- 🎥 **YouTube Video Processing**: Extract recipes directly from YouTube cooking videos
- 🤖 **AI-Powered Recipe Parsing**: Convert text descriptions into structured recipes
- 📱 **Modern UI**: Built with React and Mantine UI components
- 💾 **Local Storage**: Save your recipes locally in the browser
- 🎨 **Beautiful Recipe Cards**: Clean and organized display of recipe information
- 🔍 **Search & Filter**: Easily find recipes in your cookbook

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **UI Library**: Mantine UI
- **State Management**: Zustand
- **AI Integration**: Google Gemini API
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

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
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Adding Recipes from YouTube

1. Copy a YouTube URL of a cooking video
2. Paste it into the input field
3. Click "Add Recipe"
4. Review the AI-generated recipe
5. Accept or reject the recipe

### Adding Recipes from Text

1. Type or paste your recipe description
2. Click "Add Recipe"
3. Review the AI-generated structured recipe
4. Accept or reject the recipe

### Managing Your Cookbook

- View all your recipes in a grid layout
- Expand/collapse recipe details
- Delete recipes you no longer need
- View recipe creation dates

## Project Structure

```
easycook/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Main application screens
│   ├── services/       # API and service integrations
│   ├── store/         # State management
│   ├── types/         # TypeScript type definitions
│   └── theme.ts       # UI theme configuration
├── public/            # Static assets
└── index.html         # Application entry point
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
- Mantine UI for the beautiful components
- The open-source community for various tools and libraries

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

## Screenshots

*Coming soon*

## Roadmap

- [ ] Recipe sharing functionality
- [ ] Meal planning calendar
- [ ] Grocery list generation
- [ ] Recipe ratings and favorites
- [ ] Mobile app version
