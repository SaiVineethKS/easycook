# Theme Configuration

EasyCook uses a custom theme with Mantine UI, designed specifically for a culinary application with warm, appetizing colors and intuitive interfaces.

## Overview

The theme is defined in `src/theme.ts` and uses Mantine's theming system to create a consistent visual language across the application.

## Color Palette

The application uses a warm, food-inspired color palette:

```typescript
// Primary color - Pumpkin Orange (warm, appetizing orange)
const pumpkinOrange: MantineColorsTuple = [
  "#fff3e6",
  "#ffe2c6",
  "#ffd1a8",
  "#ffbf86",
  "#ffae64", 
  "#fd9d42", // Main brand color
  "#f88d20",
  "#e07712",
  "#c76407",
  "#ab5300"
];

// Secondary color - Olive Green (herb-inspired)
const herbGreen: MantineColorsTuple = [
  "#f2f8e8",
  "#e3efd2",
  "#d3e4b8",
  "#c3d99e",
  "#b2ce83",
  "#a1c368",
  "#91b74e",
  "#7b9d3c",
  "#69882d",
  "#56721d"
];

// Accent color - Honey Gold (warm, appetizing golden tone)
const honeyGold: MantineColorsTuple = [
  "#fff9e6",
  "#fff2cc",
  "#ffe8a8",
  "#ffdd84",
  "#ffd35f",
  "#ffc93a",
  "#ffbe15",
  "#e6a500",
  "#cc9000",
  "#b27c00"
];

// Complementary accent - Tomato Red (for attention/CTAs)
const tomatoRed: MantineColorsTuple = [
  "#ffecec",
  "#ffd9d9",
  "#ffc2c2",
  "#ffa7a7",
  "#ff8a8a",
  "#ff7070",
  "#ff5252",
  "#e63939",
  "#d12a2a",
  "#bc1a1a"
];

// Neutral tones - Warm cream/kraft paper inspired
const warmNeutral: MantineColorsTuple = [
  "#fdf8f1", // Lightest cream - page background
  "#f7f0e6",
  "#efe5d7",
  "#e6d9c7",
  "#dcc9b0", // Medium kraft
  "#c4b297",
  "#ab987c",
  "#8c7960",
  "#70614d",
  "#5b4f3f"  // Darkest brown - text color
];

// Tag blue - Custom color for tags
const tagBlue: MantineColorsTuple = [
  "#e6f2ff",
  "#cce4ff",
  "#99c9ff",
  "#66adff",
  "#3392ff",
  "#0077ff", // Main tag color
  "#0066dd",
  "#0055bb",
  "#004499",
  "#003377"
];
```

## Typography

The theme uses a carefully selected set of fonts:

```typescript
fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
fontFamilyMonospace: '"JetBrains Mono", Monaco, Courier, monospace',
headings: {
  fontFamily: '"Playfair Display", "Garamond", serif',
  fontWeight: '700',
},
```

- **Nunito**: Primary sans-serif font for body text
- **Playfair Display**: Serif font for headings, adding elegance
- **JetBrains Mono**: Monospace font for code blocks

## Component Styling

The theme customizes various Mantine components:

### AppShell

```typescript
AppShell: {
  styles: {
    main: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #fdf8f1 100%)'
    }
  }
},
```

### Button

```typescript
Button: {
  defaultProps: {
    size: 'md',
    radius: 'md',
    color: 'pumpkinOrange',
    variant: 'filled',
  },
  styles: {
    root: {
      fontWeight: 600,
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    },
  },
},
```

### Card

```typescript
Card: {
  defaultProps: {
    radius: 'md',
    withBorder: true,
    p: 'lg',
  },
  styles: {
    root: {
      backgroundColor: '#FFFFFF',
      borderColor: 'rgba(171, 83, 0, 0.15)',
      boxShadow: '0 8px 20px rgba(171, 83, 0, 0.07), 0 2px 8px rgba(171, 83, 0, 0.05)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 12px 24px rgba(171, 83, 0, 0.10), 0 4px 12px rgba(171, 83, 0, 0.07)',
      },
      '&[data-recipe-card]': {
        backgroundColor: '#FFFFFF',
        borderLeft: '4px solid #fd9d42',
      }
    },
  },
},
```

### Badge

```typescript
Badge: {
  defaultProps: {
    variant: 'filled',
    color: 'pumpkinOrange',
  },
  styles: {
    root: {
      textTransform: 'none',
      fontSize: '0.85rem',
      fontWeight: 600,
      color: 'white',
    },
  },
  variants: {
    'tag': (theme) => ({
      root: {
        backgroundColor: 'rgba(0, 119, 255, 0.2)',
        color: '#0055bb',
        fontWeight: 600,
        borderRadius: '4px',
        padding: '3px 8px',
        border: '1px solid rgba(0, 119, 255, 0.3)'
      }
    })
  }
},
```

## Reusable Design Tokens

The theme defines reusable design tokens for consistency:

```typescript
other: {
  backgroundGradient: 'linear-gradient(135deg, #FFFFFF 0%, #fdf8f1 100%)', // Subtle warm cream gradient
  cardBackgroundLight: '#FFFFFF',
  cardShadow: '0 8px 20px rgba(171, 83, 0, 0.07), 0 2px 8px rgba(171, 83, 0, 0.05)',
  cardShadowHover: '0 12px 24px rgba(171, 83, 0, 0.10), 0 4px 12px rgba(171, 83, 0, 0.07)',
  borderColor: 'rgba(171, 83, 0, 0.15)',
  paperBackground: '#FFFFFF'
},
```

## Implementation

The theme is created using Mantine's `createTheme` function:

```typescript
export const theme = createTheme({
  primaryColor: 'pumpkinOrange',
  colors: {
    pumpkinOrange,
    herbGreen,
    honeyGold,
    tomatoRed,
    warmNeutral,
    tagBlue
  },
  // ... typography and other settings
  // ... component styles
});
```

And applied to the application in `App.tsx`:

```typescript
function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/* Application content */}
    </MantineProvider>
  );
}
```

## Usage in Components

### Theme Colors

Components can access theme colors using Mantine's color props:

```jsx
<Button color="pumpkinOrange">Primary Action</Button>
<Button color="herbGreen" variant="outline">Secondary Action</Button>
<Badge color="honeyGold">New</Badge>
<Alert color="tomatoRed">Important Note</Alert>
```

### Custom Variants

Custom component variants can be used:

```jsx
<Badge variant="tag">Recipe Tag</Badge>
```

### Theme Tokens

Other theme tokens can be used in styled components:

```jsx
<Box sx={(theme) => ({
  background: theme.other.backgroundGradient,
  boxShadow: theme.other.cardShadow,
})}>
  Content
</Box>
```

## Design Guidelines

When working with the theme:

1. **Color Usage**:
   - `pumpkinOrange`: Primary actions, highlighted elements
   - `herbGreen`: Success states, environmental actions
   - `honeyGold`: Warnings, notable information
   - `tomatoRed`: Errors, destructive actions
   - `tagBlue`: Tags, labels, categorization
   - `warmNeutral`: Backgrounds, text, subtle elements

2. **Typography Scales**:
   - Headings: Use Playfair Display for elegance
   - Body text: Use Nunito for readability
   - Maintain consistent sizing using Mantine's size props

3. **Spacing**:
   - Use Mantine's spacing system (xs, sm, md, lg, xl)
   - Maintain consistent spacing within components

4. **Animations**:
   - Use subtle transitions (0.2-0.3s)
   - Apply consistent hover effects