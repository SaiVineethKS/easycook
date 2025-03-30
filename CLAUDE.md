# CLAUDE.md - EasyCook Project Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check)
- `npm run preview` - Preview production build

## Code Style
- **Imports**: Group by external/internal, alphabetize within groups
- **Formatting**: 2-space indentation, semicolons required
- **Types**: Use TypeScript interfaces, prefer explicit typing over `any`
- **Components**: Functional components with React hooks
- **State Management**: Use Zustand for global state
- **API Calls**: Error handling with try/catch, async/await pattern
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Error Handling**: Provide meaningful error messages, use try/catch blocks
- **File Structure**: Feature-based organization (screens, services, store, types)
- **React Router**: For navigation between screens
- **UI Components**: Use Mantine component library