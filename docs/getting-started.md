# Getting Started with EasyCook

This guide will help you set up the EasyCook development environment and start contributing to the project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **Git**
- A code editor (VS Code recommended)

You'll also need:

- A **Firebase** account for authentication and database
- A **Google Gemini API** key for AI functionality

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SaiVineethKS/easycook.git
   cd easycook
   ```

2. **Install dependencies**

   Using npm:
   ```bash
   npm install
   ```
   
   Or using yarn:
   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

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

   Replace the placeholder values with your actual credentials.

## Firebase Setup

1. **Create a Firebase project**

   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics if desired

2. **Set up Authentication**

   - In your Firebase project, go to "Authentication" in the left sidebar
   - Click "Get started"
   - Enable Email/Password authentication
   - Optionally enable Google authentication

3. **Create a Firestore database**

   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Start in production mode
   - Choose a database location close to your users

4. **Set up security rules**

   Add the following security rules for basic protection:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         match /recipes/{recipeId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

5. **Get your Firebase configuration**

   - Go to Project Settings (gear icon in the left sidebar)
   - Scroll down to "Your apps" section
   - If you haven't added a web app yet, click the web icon
   - Register the app with a nickname (e.g., "EasyCook Web")
   - Copy the configuration object to use in your `.env` file

## Google Gemini API Setup

1. **Set up Google AI Studio**

   - Go to [Google AI Studio](https://makersuite.google.com/)
   - Create a new API key
   - Copy the API key to use in your `.env` file

## Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   ```

   Or with yarn:
   ```bash
   yarn dev
   ```

2. **Open the application**

   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Project Structure

```
src/
├── config/             # Firebase configuration
├── contexts/           # React context providers
├── screens/            # Main application screens
├── services/           # API and service integrations
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Main Screens

- **Login Screen**: User authentication (`/login`)
- **Cookbook Screen**: Recipe management and creation (`/`)
- **Planning Screen**: Meal planning and calendar (`/planning`)
- **Execution Screen**: Step-by-step cooking guide (`/execution`)
- **Grocery List Screen**: Automated shopping lists (`/grocery`)

## Common Tasks

### Creating a Recipe

1. Navigate to the Cookbook Screen
2. Enter a recipe description or YouTube URL
3. Click "Add Recipe"
4. Review and accept the AI-processed recipe

### Planning Meals

1. Navigate to the Planning Screen
2. Select a date on the calendar
3. Add recipes to meal slots
4. Set servings and save

### Generating a Grocery List

1. Navigate to the Grocery List Screen
2. Select a date range
3. Choose which meals to include
4. View the generated list

## Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   Follow the coding guidelines in the [Development Guidelines](./development-guidelines.md).

3. **Test your changes**

   Ensure your changes work as expected and don't break existing functionality.

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

5. **Push your changes**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a pull request**

   Go to the repository on GitHub and create a pull request.

## Troubleshooting

### API Key Issues

If you encounter errors related to API keys, ensure that:
- Your `.env` file is in the root directory
- Variable names are exactly as specified
- API keys are correctly copied without extra spaces

### Firebase Connection Issues

If you can't connect to Firebase:
- Verify your Firebase project is active
- Check that authentication methods are enabled
- Ensure security rules are properly configured

### AI Processing Problems

If AI processing is not working:
- Verify your Gemini API key is valid
- Check if you've exceeded API rate limits
- Try switching to a different AI provider by changing `VITE_AI_API_TYPE`

## Additional Resources

- [Mantine UI Documentation](https://mantine.dev/docs/getting-started/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev/guide/)