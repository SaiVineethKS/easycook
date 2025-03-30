import { createTheme, MantineColorsTuple } from '@mantine/core';

const easyCookSage: MantineColorsTuple = [
  "#f2f7f2",
  "#e4ede4",
  "#d6e3d6",
  "#8ba888", // Our primary color (sage green)
  "#7a9777",
  "#ff7f6e", // Our accent color (coral)
  "#e66d5c",
  "#cc5b4a",
  "#b34938",
  "#993726"
];

export const theme = createTheme({
  primaryColor: 'easyCookSage',
  colors: {
    easyCookSage,
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily: 'Greycliff CF, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '700',
  },
  white: '#ffffff',
  black: '#2c3e50',
  defaultRadius: 'md',
  components: {
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
        color: 'easyCookSage',
        variant: 'filled',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        p: 'lg',
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#e4ede4',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        p: 'lg',
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#e4ede4',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
        color: 'easyCookSage',
      },
      styles: {
        root: {
          textTransform: 'none',
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'light',
        color: 'easyCookSage',
      },
    },
    TextInput: {
      styles: {
        input: {
          '&:focus': {
            borderColor: '#8ba888', // Sage green for focus
          },
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          '&:focus': {
            borderColor: '#8ba888', // Sage green for focus
          },
        },
      },
    },
    Divider: {
      styles: {
        root: {
          borderColor: '#e4ede4', // Light sage for dividers
        },
      },
    },
    List: {
      styles: {
        item: {
          '&::marker': {
            color: '#8ba888', // Sage green for list markers
          },
        },
      },
    },
  },
}); 