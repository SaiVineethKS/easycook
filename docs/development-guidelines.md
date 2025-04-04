# Development Guidelines

This document outlines the development standards and best practices for contributing to the EasyCook project.

## Code Style

### General Guidelines

- Use **2-space indentation** throughout the codebase
- Use **semicolons** at the end of statements
- Prefer **ES6+ features** (arrow functions, destructuring, spread syntax)
- Keep functions **small and focused** on a single responsibility
- Use **meaningful and descriptive** names for variables, functions, and components
- Add **comments** for complex logic but favor self-documenting code

### TypeScript Guidelines

- Use **explicit typing** over `any` type
- Define **interfaces** for complex object structures
- Use **type guards** when narrowing types
- Prefer **readonly** properties when appropriate
- Use **generics** for reusable code

### Import Organization

Organize imports in the following order with a blank line between sections:

1. React and React-related libraries
2. External libraries (alphabetical order)
3. Application imports (alphabetical order)
4. Type imports (alphabetical order)
5. Asset imports (CSS, images, etc.)

Example:
```typescript
import React, { useState, useEffect } from 'react';

import { Container, Group, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import { useAuth } from '../contexts/AuthContext';
import { RecipeService } from '../services/RecipeService';

import { Recipe } from '../types/Recipe';

import '../styles/component.css';
```

## Component Structure

### Functional Components

- Use **functional components** with hooks
- Destructure props at the beginning of the component
- Define all hooks at the top level
- Extract complex logic into separate hooks or functions
- Use a consistent JSX structure

Example:
```typescript
import React, { useState, useEffect } from 'react';
import { Card, Title, Text } from '@mantine/core';

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onFavorite }) => {
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    // Effect logic
  }, [recipe.id]);
  
  const handleToggleExpand = () => {
    setExpanded(prev => !prev);
  };
  
  return (
    <Card>
      <Title>{recipe.title}</Title>
      {/* Card content */}
    </Card>
  );
};
```

### File Organization

- One component per file (except for small helper components)
- Group related components in folders
- Use index files for clean exports

## State Management

### Zustand Guidelines

- Keep store definitions focused and modular
- Use selectors when accessing store values
- Implement optimistic updates for responsive UI
- Handle errors gracefully with state rollbacks

### Local State vs. Global State

- Use **local state** (useState) for:
  - UI states specific to a component
  - Form input values
  - Toggle states (expanded/collapsed)

- Use **global state** (Zustand) for:
  - Shared data across components
  - Authentication state
  - Application-wide settings
  - Cross-screen operations

## API & Services

- Keep service logic separate from components
- Implement proper error handling in services
- Use async/await pattern for async operations
- Add retry logic for critical operations
- Document service methods with JSDoc comments

## Testing

- Write tests for critical business logic
- Test components for correct rendering and behavior
- Mock external dependencies for unit tests
- Use integration tests for complex workflows
- Aim for reasonable test coverage, focusing on critical paths

## Performance Optimization

- Use memoization (useMemo, useCallback) for expensive calculations
- Implement virtualization for long lists
- Optimize re-renders with proper dependency arrays
- Use lazy loading for components and routes
- Implement proper loading states for async operations

## Accessibility

- Use semantic HTML elements
- Provide proper ARIA attributes
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers periodically

## Documentation

- Document complex functions with JSDoc comments
- Keep the project documentation up to date
- Document API changes in pull requests
- Add comments for non-obvious code solutions

## Git Workflow

### Branch Naming

Use the following format for branch names:
- `feature/short-description` for new features
- `bugfix/issue-description` for bug fixes
- `refactor/area-description` for refactoring
- `docs/update-area` for documentation updates

### Commit Messages

Write clear, concise commit messages that explain the "why" behind changes:

```
feat: Add recipe tagging functionality

Implement the ability for users to create and assign custom tags to recipes.
This enhances recipe organization and searchability.
```

### Pull Requests

- Keep PRs focused on a single issue or feature
- Provide a detailed description of changes
- Link related issues
- Request reviews from appropriate team members
- Resolve all comments before merging

## Folder Structure Conventions

```
src/
├── components/         # Reusable UI components
│   ├── Recipe/         # Component-specific folder
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx
│   │   └── index.ts
│   └── ui/             # Generic UI components
├── config/             # Configuration files
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── screens/            # Main application screens
├── services/           # API and service integrations
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Environmental Variables

- Store sensitive information in environment variables
- Document required environment variables in .env.example
- Use meaningful naming conventions
- Access environment variables with import.meta.env in Vite