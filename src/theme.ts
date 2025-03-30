import { createTheme, MantineColorsTuple } from '@mantine/core';

// Main primary color palette - Deep teal
const deepTeal: MantineColorsTuple = [
  "#eaf2f4",
  "#d5e5e9",
  "#afd2da",
  "#88c0ca",
  "#6aafbb",
  "#4da1b0",
  "#3092a2",
  "#1f7a8a",
  "#006777",
  "#005566"
];

// Secondary color - Berry Purple
const berryPurple: MantineColorsTuple = [
  "#f8ecff",
  "#ead9f4",
  "#d5b9e7",
  "#bf97d9",
  "#ab79cd",
  "#9d65c5",
  "#9458bf",
  "#7e46ab",
  "#6e3999",
  "#5e2c88"
];

// Accent color - Warm Coral
const warmCoral: MantineColorsTuple = [
  "#fff0ee",
  "#ffd9d2",
  "#ffc0b8",
  "#ffa69c",
  "#ff8c81",
  "#ff7366",
  "#ff594b",
  "#e34538",
  "#cd3428",
  "#b91c15"
];

// Neutral tones
const neutralGray: MantineColorsTuple = [
  "#f8f9fa",
  "#e9ecef",
  "#dee2e6",
  "#ced4da",
  "#adb5bd",
  "#6c757d",
  "#495057",
  "#343a40",
  "#212529",
  "#121416"
];

export const theme = createTheme({
  primaryColor: 'deepTeal',
  colors: {
    deepTeal,
    berryPurple,
    warmCoral,
    neutralGray
  },
  
  fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", Monaco, Courier, monospace',
  headings: {
    fontFamily: '"Quicksand", "Greycliff CF", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '700',
  },
  
  white: '#ffffff',
  black: '#212529',
  defaultRadius: 'md',
  
  other: {
    backgroundGradient: 'linear-gradient(135deg, #E9F7F8 0%, #F7ECFF 100%)',
    cardBackgroundLight: '#FFFFFF',
    cardShadow: '0 8px 20px rgba(0, 103, 119, 0.08), 0 2px 8px rgba(0, 103, 119, 0.06)',
    cardShadowHover: '0 12px 24px rgba(0, 103, 119, 0.12), 0 4px 12px rgba(0, 103, 119, 0.08)',
    borderColor: 'rgba(0, 103, 119, 0.15)',
    paperBackground: 'rgba(255, 255, 255, 0.9)'
  },
  
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'linear-gradient(135deg, #E9F7F8 0%, #F7ECFF 100%)'
        }
      }
    },
    
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
    
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
        color: 'deepTeal',
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
    
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        p: 'lg',
      },
      styles: {
        root: {
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0, 103, 119, 0.15)',
          boxShadow: '0 8px 20px rgba(0, 103, 119, 0.08), 0 2px 8px rgba(0, 103, 119, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(0, 103, 119, 0.12), 0 4px 12px rgba(0, 103, 119, 0.08)',
          }
        },
      },
    },
    
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
        p: 'lg',
      },
      styles: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(0, 103, 119, 0.15)',
          boxShadow: '0 8px 20px rgba(0, 103, 119, 0.08), 0 2px 8px rgba(0, 103, 119, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(0, 103, 119, 0.12), 0 4px 12px rgba(0, 103, 119, 0.08)',
          }
        },
      },
    },
    
    Badge: {
      defaultProps: {
        variant: 'light',
        color: 'deepTeal',
      },
      styles: {
        root: {
          textTransform: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
        },
      },
    },
    
    ActionIcon: {
      defaultProps: {
        variant: 'light',
        color: 'deepTeal',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    
    TextInput: {
      styles: {
        input: {
          border: '1px solid rgba(0, 103, 119, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:focus': {
            borderColor: '#3092a2',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
    
    Textarea: {
      styles: {
        input: {
          border: '1px solid rgba(0, 103, 119, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:focus': {
            borderColor: '#3092a2',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
    
    Divider: {
      styles: {
        root: {
          borderColor: 'rgba(0, 103, 119, 0.1)',
        },
      },
    },
    
    List: {
      styles: {
        item: {
          '&::marker': {
            color: '#3092a2',
          },
        },
      },
    },
    
    Title: {
      styles: {
        root: {
          '&[data-order="1"]': {
            backgroundImage: 'linear-gradient(45deg, #006777, #6e3999)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }
        }
      }
    },
    
    Accordion: {
      styles: {
        item: {
          borderColor: 'rgba(0, 103, 119, 0.1)',
        },
        control: {
          '&:hover': {
            backgroundColor: 'rgba(0, 103, 119, 0.05)',
          }
        },
        chevron: {
          color: '#3092a2',
        }
      }
    },
    
    Table: {
      styles: {
        root: {
          '& thead tr th': {
            backgroundColor: 'rgba(0, 103, 119, 0.06)',
            color: '#006777',
            fontWeight: 600,
          },
          '& tbody tr:nth-of-type(odd)': {
            backgroundColor: 'rgba(0, 103, 119, 0.02)',
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(0, 103, 119, 0.04)',
          }
        }
      }
    },
    
    Tabs: {
      styles: {
        tab: {
          fontWeight: 600,
          '&[data-active]': {
            borderColor: '#3092a2',
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 103, 119, 0.05)',
          }
        }
      }
    },
    
    Modal: {
      styles: {
        header: {
          backgroundColor: 'rgba(0, 103, 119, 0.06)',
        },
        title: {
          fontWeight: 600,
          color: '#006777',
        }
      }
    },
    
    Notification: {
      styles: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  },
});