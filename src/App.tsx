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
        <UnstyledButton>
          <Group gap={7}>
            <Avatar 
              src={user.photoURL || undefined} 
              radius="xl" 
              size="sm"
              color="blue"
            >
              {userData?.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Avatar>
            <Box style={{ maxWidth: '140px' }}>
              <Text size="sm" fw={500} truncate="end">
                {userData?.displayName || user.email?.split('@')[0] || 'User'}
              </Text>
            </Box>
            <IconChevronDown size={14} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      
      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item leftSection={<IconUser size={14} />}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} />}>
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item 
          color="red" 
          leftSection={<IconLogout size={14} />}
          onClick={logout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

// Loading spinner component
const LoadingScreen = () => (
  <Center style={{ height: '100vh', width: '100%' }}>
    <Stack align="center" spacing="md">
      <Loader size="lg" />
      <Text>Loading EasyCook...</Text>
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
            header={{ height: 60 }}
            padding="md"
          >
            <AppShell.Header>
              <Container size="lg" h="100%">
                <Group h="100%" justify="space-between">
                  <Group gap="lg">
                    <Button 
                      component={Link} 
                      to="/" 
                      variant="subtle" 
                      size="md"
                      fw={600}
                    >
                      Cookbook
                    </Button>
                    <Button 
                      component={Link} 
                      to="/planning" 
                      variant="subtle"
                      size="md"
                      fw={600}
                    >
                      Planning
                    </Button>
                    <Button 
                      component={Link} 
                      to="/execution" 
                      variant="subtle"
                      size="md"
                      fw={600}
                    >
                      Today's Meals
                    </Button>
                    <Button 
                      component={Link} 
                      to="/grocery" 
                      variant="subtle"
                      size="md"
                      fw={600}
                      leftSection={<IconShoppingCart size={16} />}
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