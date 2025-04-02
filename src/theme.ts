import { createTheme, MantineColorsTuple } from '@mantine/core';

// Primary color - Culinary Teal
const culinaryTeal: MantineColorsTuple = [
  "#e5f5f5",
  "#c5e5e6",
  "#9dd3d5",
  "#74c1c4",
  "#4aafb4",
  "#2c9fa6", // Main brand color
  "#198890",
  "#107179",
  "#075b63",
  "#00454d"
];

// Secondary color - Sage Green
const sageGreen: MantineColorsTuple = [
  "#f1f5ed",
  "#e0e9d9",
  "#cddcbf",
  "#bacfa6",
  "#a6c28b",
  "#95b872",
  "#84ad59",
  "#6e9445",
  "#5a7c34",
  "#466320"
];

// Accent color - Golden Saffron
const saffronGold: MantineColorsTuple = [
  "#fff8e1",
  "#ffecb3",
  "#ffe082",
  "#ffd54f",
  "#ffca28",
  "#ffc107",
  "#ffb300",
  "#ffa000",
  "#ff8f00",
  "#ff6f00"
];

// Complementary accent - Berry Red
const berryRed: MantineColorsTuple = [
  "#ffeaee",
  "#ffd6de",
  "#ffa8b9",
  "#ff7a94",
  "#ff4c71",
  "#ff1e4e",
  "#f50042",
  "#d6003a",
  "#b80031",
  "#990029"
];

// Neutral - Slate with warm undertones
const warmSlate: MantineColorsTuple = [
  "#f8f9fa", // Lightest slate - background
  "#f0f2f3",
  "#e3e7ea",
  "#d6dce0",
  "#c8d0d6",
  "#b6bfc7",
  "#9ba7b2",
  "#7e8c9a",
  "#5c6b7a",
  "#38465a"  // Darkest slate - text
];

export const theme = createTheme({
  primaryColor: 'culinaryTeal',
  colors: {
    culinaryTeal,
    sageGreen,
    saffronGold,
    berryRed,
    warmSlate
  },
  
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace: "'Roboto Mono', Monaco, Courier, monospace",
  headings: {
    fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: '700',
  },
  
  white: '#ffffff',
  black: '#2C3E50', // Rich dark slate instead of pure black
  defaultRadius: 'md',
  
  other: {
    backgroundGradient: 'linear-gradient(135deg, #f8f9fa 0%, #f0f2f3 100%)',
    cardBackgroundLight: '#FFFFFF',
    cardShadow: '0 10px 25px rgba(44, 158, 166, 0.08), 0 6px 12px rgba(44, 158, 166, 0.04)',
    cardShadowHover: '0 14px 30px rgba(44, 158, 166, 0.12), 0 8px 20px rgba(44, 158, 166, 0.08)',
    borderColor: 'rgba(44, 158, 166, 0.15)',
    contentBgColor: '#FFFFFF'
  },
  
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f2f3 100%)'
        }
      }
    },
    
    Container: {
      defaultProps: {
        size: 'lg',
      },
      styles: {
        root: {
          paddingTop: '20px',
          paddingBottom: '40px'
        }
      }
    },
    
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
        color: 'culinaryTeal',
        variant: 'filled',
      },
      styles: {
        root: {
          fontWeight: 600,
          boxShadow: '0 4px 6px rgba(44, 158, 166, 0.15)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 10px rgba(44, 158, 166, 0.25)'
          }
        },
      },
      variants: {
        primary: (theme) => ({
          root: {
            backgroundColor: theme.colors.culinaryTeal[6],
            color: theme.white,
            '&:hover': {
              backgroundColor: theme.colors.culinaryTeal[7]
            }
          }
        }),
        accent: (theme) => ({
          root: {
            backgroundColor: theme.colors.saffronGold[5],
            color: theme.black,
            '&:hover': {
              backgroundColor: theme.colors.saffronGold[6]
            }
          }
        }),
        danger: (theme) => ({
          root: {
            backgroundColor: theme.colors.berryRed[6],
            color: theme.white,
            '&:hover': {
              backgroundColor: theme.colors.berryRed[7]
            }
          }
        })
      }
    },
    
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
        p: 'xl',
      },
      styles: {
        root: {
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(44, 158, 166, 0.12)',
          boxShadow: '0 10px 25px rgba(44, 158, 166, 0.08), 0 6px 12px rgba(44, 158, 166, 0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 14px 30px rgba(44, 158, 166, 0.12), 0 8px 20px rgba(44, 158, 166, 0.08)',
          },
          '&[data-recipe-card]': {
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #2c9fa6 0%, #95b872 100%)'
            }
          }
        },
      }
    },
    
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
        p: 'xl',
      },
      styles: {
        root: {
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(44, 158, 166, 0.12)',
          boxShadow: '0 10px 25px rgba(44, 158, 166, 0.06), 0 6px 12px rgba(44, 158, 166, 0.03)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 28px rgba(44, 158, 166, 0.09), 0 8px 16px rgba(44, 158, 166, 0.06)',
          }
        },
      },
      variants: {
        'recipe-card': (theme) => ({
          root: {
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 16px 30px rgba(44, 158, 166, 0.15), 0 8px 16px rgba(44, 158, 166, 0.08)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #2c9fa6 0%, #95b872 100%)'
            }
          }
        })
      }
    },
    
    Badge: {
      styles: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          padding: '0.3rem 0.6rem',
          borderRadius: 'var(--mantine-radius-sm)',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          transition: 'all 0.2s ease',
        },
        light: {
          backgroundColor: 'rgba(44, 158, 166, 0.1)',
          color: 'var(--mantine-color-culinaryTeal-7)',
        },
        filled: {
          boxShadow: '0 2px 5px rgba(44, 158, 166, 0.2)'
        },
        outline: {
          borderWidth: '1.5px'
        }
      }
    },
    
    ActionIcon: {
      defaultProps: {
        variant: 'light',
        color: 'culinaryTeal',
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
          border: '1.5px solid rgba(44, 158, 166, 0.15)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 'var(--mantine-radius-md)',
          padding: '12px 16px',
          '&:focus': {
            borderColor: 'var(--mantine-color-culinaryTeal-5)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 0 0 3px rgba(44, 158, 166, 0.1)'
          },
        },
        label: {
          fontWeight: 500,
          marginBottom: '6px'
        }
      },
    },
    
    Textarea: {
      styles: {
        input: {
          border: '1.5px solid rgba(44, 158, 166, 0.15)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 'var(--mantine-radius-md)',
          padding: '12px 16px',
          '&:focus': {
            borderColor: 'var(--mantine-color-culinaryTeal-5)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 0 0 3px rgba(44, 158, 166, 0.1)'
          },
        },
        label: {
          fontWeight: 500,
          marginBottom: '6px'
        }
      },
    },
    
    Divider: {
      styles: {
        root: {
          borderColor: 'rgba(44, 158, 166, 0.08)',
          borderWidth: '1px',
          '&[data-orientation="horizontal"]': {
            marginTop: '16px',
            marginBottom: '16px'
          }
        },
      },
    },
    
    List: {
      styles: {
        item: {
          padding: '5px 0',
          '&::marker': {
            color: 'var(--mantine-color-culinaryTeal-6)',
            fontWeight: 'bold'
          },
        },
      },
    },
    
    Title: {
      styles: {
        root: {
          color: '#2C3E50',
          '&:where([data-order="1"])': {
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(90deg, #2c9fa6, #096e78)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          },
          '&:where([data-order="2"])': {
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#2C3E50'
          },
          '&:where([data-order="3"])': {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--mantine-color-culinaryTeal-7)'
          }
        }
      }
    },
    
    Accordion: {
      styles: {
        item: {
          borderColor: 'rgba(44, 158, 166, 0.08)',
          borderWidth: '1px',
          marginBottom: '8px',
          borderRadius: 'var(--mantine-radius-md)',
          overflow: 'hidden'
        },
        control: {
          padding: '16px',
          '&:hover': {
            backgroundColor: 'rgba(44, 158, 166, 0.05)',
          }
        },
        panel: {
          padding: '0 16px 16px'
        },
        chevron: {
          color: 'var(--mantine-color-culinaryTeal-6)',
        }
      }
    },
    
    Table: {
      styles: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0',
          '& thead tr th': {
            backgroundColor: 'rgba(44, 158, 166, 0.08)',
            color: 'var(--mantine-color-culinaryTeal-9)',
            fontWeight: 600,
            padding: '14px 20px',
            borderBottom: '2px solid rgba(44, 158, 166, 0.12)',
            '&:first-of-type': {
              borderTopLeftRadius: 'var(--mantine-radius-md)'
            },
            '&:last-of-type': {
              borderTopRightRadius: 'var(--mantine-radius-md)'
            }
          },
          '& tbody tr td': {
            padding: '12px 20px',
            borderBottom: '1px solid rgba(44, 158, 166, 0.06)'
          },
          '& tbody tr:last-of-type td': {
            borderBottom: 'none',
            '&:first-of-type': {
              borderBottomLeftRadius: 'var(--mantine-radius-md)'
            },
            '&:last-of-type': {
              borderBottomRightRadius: 'var(--mantine-radius-md)'
            }
          },
          '& tbody tr:nth-of-type(odd)': {
            backgroundColor: 'rgba(44, 158, 166, 0.02)',
          },
          '& tbody tr:hover': {
            backgroundColor: 'rgba(44, 158, 166, 0.05)',
          }
        }
      }
    },
    
    Tabs: {
      styles: {
        tab: {
          fontWeight: 600,
          '&[data-active]': {
            borderColor: 'var(--mantine-color-culinaryTeal-6)',
            color: 'var(--mantine-color-culinaryTeal-8)'
          },
          '&:hover': {
            backgroundColor: 'rgba(44, 158, 166, 0.05)',
            color: 'var(--mantine-color-culinaryTeal-7)'
          }
        }
      }
    },
    
    Modal: {
      styles: {
        header: {
          backgroundColor: 'rgba(44, 158, 166, 0.06)',
          padding: '16px 24px',
          marginBottom: '20px'
        },
        title: {
          fontWeight: 700,
          fontSize: '1.2rem',
          color: 'var(--mantine-color-culinaryTeal-9)',
        },
        close: {
          color: 'var(--mantine-color-culinaryTeal-6)',
          '&:hover': {
            backgroundColor: 'rgba(44, 158, 166, 0.1)',
          }
        },
        body: {
          padding: '0 24px 24px'
        }
      }
    },
    
    Notification: {
      styles: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(44, 158, 166, 0.15)',
          border: 'none'
        },
        title: {
          fontWeight: 600,
          marginBottom: '6px'
        }
      }
    },
    
    Checkbox: {
      styles: {
        input: {
          borderRadius: '4px',
          borderWidth: '1.5px',
          borderColor: 'rgba(44, 158, 166, 0.3)',
          '&:checked': {
            backgroundColor: 'var(--mantine-color-culinaryTeal-6)',
            borderColor: 'var(--mantine-color-culinaryTeal-6)'
          },
          '&:hover': {
            borderColor: 'var(--mantine-color-culinaryTeal-5)'
          }
        }
      }
    },
  },
});