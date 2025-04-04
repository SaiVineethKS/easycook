# Login Screen

The Login Screen handles user authentication for the EasyCook application, providing a secure gateway to the app's functionality.

## Features

1. **Authentication Methods**
   - Email/Password authentication
   - Google sign-in integration
   - Guest mode (if applicable)

2. **User Registration**
   - New account creation
   - Password requirements validation
   - Email verification (optional)

3. **Password Management**
   - Password reset functionality
   - "Remember me" option
   - Secure password handling

4. **UI Elements**
   - Branded login form
   - Sign-in provider buttons
   - Loading states
   - Error messaging

## Implementation

### State Management

The Login Screen uses the following state variables:

- `email`: User email input
- `password`: User password input
- `loading`: Authentication process state
- `error`: Authentication error messages
- `rememberMe`: Persistence preference

### Authentication Flow

The authentication process follows this sequence:

1. User enters credentials or selects sign-in method
2. UI shows loading state
3. Authentication request is sent to Firebase
4. On success, user is redirected to the Cookbook Screen
5. On failure, error message is displayed

### Firebase Integration

Firebase Authentication is used for:
- User identity management
- Secure credential storage
- Multi-provider authentication
- Session management

## UI Components

### Login Form Component
```jsx
<Card shadow="lg" p="xl" radius="md" withBorder>
  <Card.Section bg="pumpkinOrange.6" py="md">
    <Center>
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
        EasyCook<Text component="span" span fw={600} style={{ fontFamily: '"Nunito", sans-serif' }}>AI</Text>
      </Text>
    </Center>
  </Card.Section>
  
  <form onSubmit={handleSubmit}>
    <Stack spacing="md" mt="md">
      <TextInput
        required
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error?.includes('email') && "Invalid email address"}
      />
      
      <PasswordInput
        required
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error?.includes('password') && "Password must be at least 6 characters"}
      />
      
      <Group position="apart" mt="md">
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.currentTarget.checked)}
        />
        <Anchor size="sm" onClick={handleForgotPassword}>
          Forgot password?
        </Anchor>
      </Group>
      
      <Button fullWidth type="submit" loading={loading}>
        Sign in
      </Button>
      
      <Divider label="Or continue with" labelPosition="center" />
      
      <Button
        fullWidth
        leftIcon={<GoogleIcon />}
        variant="outline"
        onClick={handleGoogleSignIn}
        loading={googleLoading}
      >
        Google
      </Button>
      
      <Text size="sm" align="center" mt="md">
        Don't have an account?{' '}
        <Anchor size="sm" onClick={switchToRegister}>
          Register
        </Anchor>
      </Text>
    </Stack>
  </form>
</Card>
```

### Registration Form Component
```jsx
<Card shadow="lg" p="xl" radius="md" withBorder>
  <Card.Section bg="pumpkinOrange.6" py="md">
    <Center>
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
        Create Account
      </Text>
    </Center>
  </Card.Section>
  
  <form onSubmit={handleRegister}>
    <Stack spacing="md" mt="md">
      <TextInput
        required
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <PasswordInput
        required
        label="Password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <PasswordInput
        required
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={confirmPassword !== password && "Passwords don't match"}
      />
      
      <Button fullWidth type="submit" loading={loading}>
        Register
      </Button>
      
      <Text size="sm" align="center" mt="md">
        Already have an account?{' '}
        <Anchor size="sm" onClick={switchToLogin}>
          Sign in
        </Anchor>
      </Text>
    </Stack>
  </form>
</Card>
```

## Services Used

1. **AuthContext**: React context for authentication state
2. **Firebase Authentication**: Backend authentication service

## Data Flow

1. User enters credentials
2. Credentials are validated and sent to Firebase
3. Firebase authenticates and returns user information
4. AuthContext updates with user state
5. User is redirected to main application

## Special Considerations

1. **Security**
   - HTTPS for all authentication traffic
   - Secure credential handling
   - Protection against brute force attacks
   - No client-side storage of raw passwords

2. **User Experience**
   - Clear error messages
   - Persistent sessions with "Remember me"
   - Smooth transitions between login states
   - Responsive design for all devices

3. **Error Handling**
   - Network connectivity issues
   - Invalid credentials
   - Account not found scenarios
   - Firebase service disruptions