import { createTheme, MantineColorsTuple } from '@mantine/core';

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

// Tag blue - a deeper, more readable blue for tags
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
  
  fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", Monaco, Courier, monospace',
  headings: {
    fontFamily: '"Playfair Display", "Garamond", serif',
    fontWeight: '700',
  },
  
  white: '#ffffff',
  black: '#5b4f3f', // Warm dark brown instead of pure black
  defaultRadius: 'md',
  
  other: {
    backgroundGradient: 'linear-gradient(135deg, #FFFFFF 0%, #fdf8f1 100%)', // Subtle warm cream gradient
    cardBackgroundLight: '#FFFFFF',
    cardShadow: '0 8px 20px rgba(171, 83, 0, 0.07), 0 2px 8px rgba(171, 83, 0, 0.05)',
    cardShadowHover: '0 12px 24px rgba(171, 83, 0, 0.10), 0 4px 12px rgba(171, 83, 0, 0.07)',
    borderColor: 'rgba(171, 83, 0, 0.15)',
    paperBackground: '#FFFFFF'
  },
  
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'linear-gradient(135deg, #FFFFFF 0%, #fdf8f1 100%)'
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
      variants: {
        recipe: {
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #fd9d42',
        }
      }
    },
    
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
        p: 'lg',
      },
      styles: {
        root: {
          backgroundColor: '#FFFFFF',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(171, 83, 0, 0.15)',
          boxShadow: '0 8px 20px rgba(171, 83, 0, 0.07), 0 2px 8px rgba(171, 83, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(171, 83, 0, 0.10), 0 4px 12px rgba(171, 83, 0, 0.07)',
          }
        },
      },
    },
    
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
        light: {
          backgroundColor: 'rgba(253, 157, 66, 0.15)',
          color: '#e07712',
        },
        filled: {
          boxShadow: '0 2px 5px rgba(171, 83, 0, 0.2)'
        },
        outline: {
          borderWidth: '1.5px'
        }
      },
      // Custom variants for specific use cases
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
    
    ActionIcon: {
      defaultProps: {
        variant: 'light',
        color: 'pumpkinOrange',
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
          border: '1px solid rgba(171, 83, 0, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:focus': {
            borderColor: '#fd9d42',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
    
    Textarea: {
      styles: {
        input: {
          border: '1px solid rgba(171, 83, 0, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:focus': {
            borderColor: '#fd9d42',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
    
    Divider: {
      styles: {
        root: {
          borderColor: 'rgba(171, 83, 0, 0.1)',
        },
      },
    },
    
    List: {
      styles: {
        item: {
          '&::marker': {
            color: '#fd9d42',
          },
        },
      },
    },
    
    Title: {
      styles: {
        root: {
          '&[data-order="1"]': {
            color: '#ab5300',
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '-0.01em',
          }
        }
      }
    },
    
    Accordion: {
      styles: {
        item: {
          borderColor: 'rgba(171, 83, 0, 0.1)',
        },
        control: {
          '&:hover': {
            backgroundColor: 'rgba(171, 83, 0, 0.05)',
          }
        },
        chevron: {
          color: '#fd9d42',
        }
      }
    },
    
    Table: {
      styles: {
        root: {
          '& thead tr th': {
            backgroundColor: 'rgba(171, 83, 0, 0.06)',
            color: '#ab5300',
            fontWeight: 600,
          },
          '& tbody tr:nth-of-type(odd)': {
            backgroundColor: 'rgba(171, 83, 0, 0.02)',
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(171, 83, 0, 0.04)',
          }
        }
      }
    },
    
    Tabs: {
      styles: {
        tab: {
          fontWeight: 600,
          '&[data-active]': {
            borderColor: '#fd9d42',
          },
          '&:hover': {
            backgroundColor: 'rgba(171, 83, 0, 0.05)',
          }
        }
      }
    },
    
    Modal: {
      styles: {
        header: {
          backgroundColor: 'rgba(171, 83, 0, 0.06)',
        },
        title: {
          fontWeight: 600,
          color: '#ab5300',
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