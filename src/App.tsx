import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
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
  IconShoppingCart,
  IconBook,
  IconCalendar,
  IconToolsKitchen2
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
            height: '100%',
            display: 'flex',
            alignItems: 'center'
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
          boxShadow: '0 10px 30px rgba(171, 83, 0, 0.15)',
          border: '1px solid rgba(171, 83, 0, 0.1)',
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
      background: 'linear-gradient(135deg, #FFFFFF 0%, #fdf8f1 100%)'
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
          background: 'linear-gradient(90deg, #e07712, #fd9d42)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 1px 2px rgba(171, 83, 0, 0.05)'
        }}
      >
        Loading EasyCook<Text span component="span" style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 600, opacity: 0.9 }}>AI</Text>...
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
    // Redirect to landing page if not logged in
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// New Layout for the main application using AppShell
const MainAppLayout = () => {
  const location = useLocation(); // Get current location

  // Helper to check if a link is active
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
      style={{ background: theme.colors.background?.[0] || '#fdfdfd' }} // Add a default background
    >
      <AppShell.Header style={{ 
        background: 'linear-gradient(135deg, #e07712 0%, #fd9d42 55%, #ffc93a 100%)',
        boxShadow: '0 2px 10px rgba(171, 83, 0, 0.15)',
        border: 'none' 
      }}>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Group gap="lg" h="100%" align="center">
              {/* Logo */}
              <UnstyledButton component={Link} to="/app" style={{ textDecoration: 'none' }}>
                <Text 
                  fw={800} 
                  size="xl" 
                  c="white"
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    letterSpacing: '-0.01em',
                    textShadow: '0 1px 3px rgba(171, 83, 0, 0.2)'
                  }}
                >
                  EasyCook<Text component="span" c="rgba(255,255,255,0.8)" span fw={600} style={{ fontFamily: '"Nunito", sans-serif' }}>AI</Text>
                </Text>
              </UnstyledButton>
              
              {/* Navigation Links */}
              <Group gap={0} style={{ height: '100%' }}> 
                <Button 
                  component={Link} 
                  to="/app/cookbook" // Updated path
                  variant="subtle" 
                  color="white"
                  size="md"
                  fw={600}
                  px="lg" // Increased padding
                  leftSection={<IconBook size={16} />} // Added Icon
                  data-active={isActive('/app/cookbook')} // Active state check
                  style={{ 
                    borderRadius: 0,
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                    borderBottom: isActive('/app/cookbook') ? '3px solid white' : '3px solid transparent',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                  styles={(theme) => ({
                     root: {
                       '&:hover': {
                         backgroundColor: 'rgba(255, 255, 255, 0.1)'
                       },
                     },
                     inner: { height: '100%' },
                     section: { marginRight: theme.spacing.xs }
                   })}
                >
                  Cookbook
                </Button>
                <Button 
                  component={Link} 
                  to="/app/planning" // Updated path
                  variant="subtle"
                  color="white"
                  size="md"
                  fw={600}
                  px="lg" // Increased padding
                  leftSection={<IconCalendar size={16} />} // Added Icon
                  data-active={isActive('/app/planning')} // Active state check
                  style={{ 
                    borderRadius: 0,
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                    borderBottom: isActive('/app/planning') ? '3px solid white' : '3px solid transparent',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                   styles={(theme) => ({
                     root: {
                       '&:hover': {
                         backgroundColor: 'rgba(255, 255, 255, 0.1)'
                       },
                     },
                     inner: { height: '100%' },
                     section: { marginRight: theme.spacing.xs }
                   })}
                >
                  Planning
                </Button>
                <Button 
                  component={Link} 
                  to="/app/execution" // Updated path
                  variant="subtle"
                  color="white"
                  size="md"
                  fw={600}
                  px="lg" // Increased padding
                  leftSection={<IconToolsKitchen2 size={16} />} // Added Icon
                  data-active={isActive('/app/execution')} // Active state check
                  style={{ 
                    borderRadius: 0,
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                    borderBottom: isActive('/app/execution') ? '3px solid white' : '3px solid transparent',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                   styles={(theme) => ({
                     root: {
                       '&:hover': {
                         backgroundColor: 'rgba(255, 255, 255, 0.1)'
                       },
                     },
                     inner: { height: '100%' },
                     section: { marginRight: theme.spacing.xs }
                   })}
                >
                  Today's Meals
                </Button>
                <Button 
                  component={Link} 
                  to="/app/grocery" // Updated path
                  variant="subtle"
                  color="white"
                  size="md"
                  fw={600}
                  px="lg" // Increased padding
                  leftSection={<IconShoppingCart size={16} />}
                  data-active={isActive('/app/grocery')} // Active state check
                  style={{ 
                    borderRadius: 0,
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 0,
                    paddingBottom: 0,
                    borderBottom: isActive('/app/grocery') ? '3px solid white' : '3px solid transparent',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                   styles={(theme) => ({
                     root: {
                       '&:hover': {
                         backgroundColor: 'rgba(255, 255, 255, 0.1)'
                       },
                     },
                     inner: { height: '100%' },
                     section: { marginRight: theme.spacing.xs }
                   })}
                >
                  Grocery List
                </Button>
              </Group>
            </Group>
            
            <UserMenu /> {/* Include User Menu in the header */}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet /> {/* Renders the matched nested route component */}
      </AppShell.Main>
    </AppShell>
  );
};

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AuthProvider>
        <BrowserRouter>
          {/* Use Routes instead of AppShell directly */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginScreen />} />
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected Application Routes */}
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <MainAppLayout /> 
                </ProtectedRoute>
              }
            >
              {/* Default route for /app */}
              <Route index element={<Navigate to="cookbook" replace />} /> 
              {/* Nested routes within MainAppLayout */}
              <Route path="cookbook" element={<CookbookScreen />} />
              <Route path="planning" element={<PlanningScreen />} />
              <Route path="execution" element={<ExecutionScreen />} />
              <Route path="grocery" element={<GroceryListScreen />} />
              {/* Add other protected routes here */}
            </Route>
            
            {/* Fallback for unknown routes (optional) */}
            {/* <Route path="*" element={<NotFoundScreen />} /> */}

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;