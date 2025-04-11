import React from 'react';
import { useState } from 'react';
import { 
  Button, 
  Stack, 
  Text, 
  Paper, 
  Center, 
  Title, 
  Alert,
  Divider,
  Box,
  Image,
  Loader
} from '@mantine/core';
import { IconBrandGoogle, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, error, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      navigate('/app');
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Paper shadow="md" p="xl" radius="md" w={450}>
        <Stack align="center" spacing="lg">
          <Box mb={10}>
            <Title order={1} fw={700} ta="center" mb={5}>Welcome to EasyCook</Title>
            <Text c="dimmed" ta="center" size="lg">
              Your AI-powered meal planning assistant
            </Text>
          </Box>

          {/* Features list */}
          <Box w="100%" mb={10}>
            <Text c="dimmed" ta="center" mb={10}>
              Plan your meals, manage recipes, and create shopping lists with ease
            </Text>
            
            <Divider my="md" />
          </Box>

          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Authentication Error" 
              color="red" 
              radius="md"
              withCloseButton
              onClose={() => {}}
            >
              {error}
            </Alert>
          )}
          
          <Button
            leftSection={<IconBrandGoogle size={20} />}
            rightSection={isSigningIn ? <Loader size="xs" color="white" /> : null}
            color="blue"
            size="lg"
            fullWidth
            onClick={handleSignIn}
            loading={isSigningIn}
            disabled={isSigningIn || loading}
          >
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <Text size="xs" c="dimmed" ta="center" mt={5}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}; 