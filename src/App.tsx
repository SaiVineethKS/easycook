import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  MantineProvider, 
  AppShell, 
  Group, 
  Button, 
  Container, 
  Center, 
  Stack, 
  Text, 
  Loader,
  Menu,
  Avatar,
  UnstyledButton,
  Box
} from '@mantine/core';
import { 
  IconLogout, 
  IconUser, 
  IconChevronDown,
  IconSettings,
  IconShoppingCart
} from '@tabler/icons-react';
import { AuthProvider } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { CookbookScreen } from './screens/CookbookScreen';
import { PlanningScreen } from './screens/PlanningScreen';
import { ExecutionScreen } from './screens/ExecutionScreen';
import { GroceryListScreen } from './screens/GroceryListScreen';
import { theme } from './theme';
import '@mantine/core/styles.css';
import { useAuth } from './contexts/AuthContext';

// User menu component that shows user profile and logout option
const UserMenu = () => {
  const { user, userData, logout } = useAuth();

  // If user is not logged in, don't render the menu
  if (!user) {
    return null;
  }

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton
          style={{
            transition: 'all 0.2s ease',
            borderRadius: '8px',
            padding: '6px 10px',
          }}
          sx={(theme) => ({
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          })}
        >
          <Group gap={7}>
            <Avatar 
              src={user.photoURL || undefined} 
              radius="xl" 
              size="sm"
              color="herbGreen"
              style={{ border: '2px solid rgba(255, 255, 255, 0.7)' }}
            >
              {userData?.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Avatar>
            <Box style={{ maxWidth: '140px' }}>
              <Text size="sm" fw={600} c="white" truncate="end">
                {userData?.displayName || user.email?.split('@')[0] || 'User'}
              </Text>
            </Box>
            <IconChevronDown size={14} color="white" />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      
      <Menu.Dropdown
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 103, 119, 0.1)',
        }}
      >
        <Menu.Label style={{ backgroundColor: 'rgba(171, 83, 0, 0.05)', fontWeight: 600 }}>
          Account
        </Menu.Label>
        <Menu.Item leftSection={<IconUser size={14} color="#fd9d42" />}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} color="#fd9d42" />}>
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item 
          color="tomatoRed" 
          leftSection={<IconLogout size={14} />}
          onClick={logout}
          style={{ fontWeight: 500 }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

// Loading spinner component
const LoadingScreen = () => (
  <Center 
    style={{ 
      height: '100vh', 
      width: '100%',
      background: 'linear-gradient(135deg, #fdf8f1 0%, #fff9e6 100%)'
    }}
  >
    <Stack align="center" spacing="md">
      <div style={{ position: 'relative' }}>
        <Loader 
          size="xl" 
          color="pumpkinOrange"
          style={{ 
            filter: 'drop-shadow(0 0 10px rgba(171, 83, 0, 0.25))'
          }}
        />
      </div>
      <Text 
        size="lg"
        fw={700}
        style={{
          fontFamily: '"Playfair Display", serif',
          color: '#ab5300',
          textShadow: '0 1px 2px rgba(171, 83, 0, 0.15)'
        }}
      >
        Loading EasyCook<Text span component="span" style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 600, opacity: 0.8 }}>AI</Text>...
      </Text>
    </Stack>
  </Center>
);

// Protected route that requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AuthProvider>
        <BrowserRouter>
          <AppShell
            header={{ height: 70 }}
            padding="md"
          >
            <AppShell.Header style={{ 
              background: 'linear-gradient(135deg, #e07712 0%, #fd9d42 55%, #ffc93a 100%)',
              boxShadow: '0 2px 10px rgba(171, 83, 0, 0.15)',
              border: 'none' 
            }}>
              <Container size="lg" h="100%">
                <Group h="100%" justify="space-between">
                  <Group gap="xs" h="100%" align="center">
                    <Text 
                      fw={800} 
                      size="xl" 
                      c="white"
                      mr="md"
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        letterSpacing: '-0.01em',
                        textShadow: '0 1px 3px rgba(171, 83, 0, 0.2)'
                      }}
                    >
                      EasyCook<Text component="span" c="rgba(255,255,255,0.8)" span fw={600} style={{ fontFamily: '"Nunito", sans-serif' }}>AI</Text>
                    </Text>
                    
                    <Button 
                      component={Link} 
                      to="/" 
                      variant="subtle" 
                      color="white"
                      size="md"
                      fw={600}
                      styles={{
                        root: {
                          ':hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }}
                    >
                      Cookbook
                    </Button>
                    <Button 
                      component={Link} 
                      to="/planning" 
                      variant="subtle"
                      color="white"
                      size="md"
                      fw={600}
                      styles={{
                        root: {
                          ':hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }}
                    >
                      Planning
                    </Button>
                    <Button 
                      component={Link} 
                      to="/execution" 
                      variant="subtle"
                      color="white"
                      size="md"
                      fw={600}
                      styles={{
                        root: {
                          ':hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }}
                    >
                      Today's Meals
                    </Button>
                    <Button 
                      component={Link} 
                      to="/grocery" 
                      variant="subtle"
                      color="white"
                      size="md"
                      fw={600}
                      leftSection={<IconShoppingCart size={16} />}
                      styles={{
                        root: {
                          ':hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }}
                    >
                      Grocery List
                    </Button>
                  </Group>
                  
                  <UserMenu />
                </Group>
              </Container>
            </AppShell.Header>

            <AppShell.Main>
              <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <CookbookScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/planning"
                  element={
                    <ProtectedRoute>
                      <PlanningScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/execution"
                  element={
                    <ProtectedRoute>
                      <ExecutionScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/grocery"
                  element={
                    <ProtectedRoute>
                      <GroceryListScreen />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AppShell.Main>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;