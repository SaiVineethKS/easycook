# EasyCook - Developer Documentation

Welcome to the EasyCook developer documentation. This guide provides comprehensive information about the application architecture, features, and implementation details to help developers understand and contribute to the project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Screens](#screens)
5. [Services](#services)
6. [State Management](#state-management)
7. [Authentication](#authentication)
8. [UI Components](#ui-components)
9. [Development Guidelines](#development-guidelines)

## Project Overview

EasyCook is an AI-powered recipe assistant that helps users create, manage, and organize recipes. The application can extract recipes from YouTube cooking videos or process text descriptions, making it easy to build a personal digital cookbook.

### Key Features

- Recipe extraction from YouTube videos with timestamp synchronization
- Step-by-step cooking guide with integrated YouTube playback
- Voice recording for recipe entry
- AI-powered recipe parsing
- Meal planning with calendar integration
- Automatic grocery list generation
- Tag-based recipe organization
- User authentication and cloud storage

## Getting Started

For detailed setup instructions, refer to the [Getting Started Guide](./getting-started.md).

## Architecture

EasyCook is built with a modern React architecture, focused on component reusability and clean separation of concerns.

### Project Structure

```
easycook/
├── src/
│   ├── config/         # Firebase configuration
│   ├── contexts/       # React context providers
│   ├── screens/        # Main application screens
│   ├── services/       # API and service integrations
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── theme.ts        # UI theme configuration
├── public/             # Static assets
└── index.html          # Application entry point
```

## Screens

EasyCook consists of five main screens:

1. [Login Screen](./screens/login-screen.md) - User authentication
2. [Cookbook Screen](./screens/cookbook-screen.md) - Recipe management and creation
3. [Planning Screen](./screens/planning-screen.md) - Meal planning and calendar
4. [Execution Screen](./screens/execution-screen.md) - Step-by-step cooking guide
5. [Grocery List Screen](./screens/grocery-list-screen.md) - Automated shopping lists

## Services

The application uses several services for different functionalities:

1. [AI Service](./services/ai-service.md) - Integration with AI models
2. [Audio Service](./services/audio-service.md) - Voice recording and processing
3. [Recipe Service](./services/recipe-service.md) - Recipe management with Firebase
4. [Gemini Service](./services/gemini-service.md) - Google Gemini AI integration
5. [Vertex AI Service](./services/vertex-ai-service.md) - Google Vertex AI integration
6. [Google Keep Service](./services/google-keep-service.md) - Integration with Google Keep

## State Management

EasyCook uses [Zustand](./state-management.md) for global state management, with a focus on simplicity and performance.

## Authentication

User authentication is handled through [Firebase Authentication](./authentication.md).

## UI Components

The application uses [Mantine UI](https://mantine.dev/) for its component library, with custom styling defined in the [theme configuration](./theme.md).

## Development Guidelines

Please refer to the [Development Guidelines](./development-guidelines.md) for code style, commit message format, and contribution workflow.