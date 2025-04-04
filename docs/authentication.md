# Authentication

EasyCook uses Firebase Authentication for secure user management, providing a reliable and scalable authentication system.

## Overview

Authentication in EasyCook is implemented using:

1. Firebase Authentication for backend services
2. React Context API for state management
3. Protected routes for access control

## Authentication Context

The application uses a custom `AuthContext` (`src/contexts/AuthContext.tsx`) to provide authentication state and methods throughout the component tree:

```typescript
interface AuthContextProps {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
```

## Key Components

### AuthProvider

The `AuthProvider` component initializes Firebase authentication, listens for auth state changes, and provides authentication methods to child components:

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Authentication methods
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Other methods...

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
    signup,
    googleSignIn,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### useAuth Hook

A custom hook simplifies authentication state access within components:

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### ProtectedRoute Component

The `ProtectedRoute` component ensures that only authenticated users can access certain routes:

```typescript
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
```

## Authentication Flow

1. **Login Process**:
   - User enters credentials or selects sign-in method
   - Authentication request is sent to Firebase
   - On success, Firebase updates auth state
   - AuthContext detects change and updates local state
   - User is redirected to the protected content

2. **Session Management**:
   - Firebase handles token refresh automatically
   - Auth state is preserved across page reloads
   - Session timeout based on Firebase configuration

3. **Logout Process**:
   - User initiates logout
   - Firebase clears authentication state
   - AuthContext updates local state
   - User is redirected to login screen

## Implementation in Routes

Authentication protection is applied at the route level:

```typescript
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
  {/* Other protected routes */}
</Routes>
```

## User Data Storage

Additional user data is stored in Firestore:

```typescript
interface UserData {
  displayName?: string;
  email: string;
  photoURL?: string;
  preferences?: {
    theme?: string;
    defaultServings?: number;
    unitSystem?: 'metric' | 'imperial';
  };
  createdAt: Date;
}
```

## Firebase Configuration

Authentication is configured in `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Security Best Practices

1. **Environment Variables**:
   - Firebase credentials stored in environment variables
   - No hardcoded secrets in source code

2. **Proper Authentication State Handling**:
   - Loading states prevent premature rendering
   - Clear error handling for authentication failures

3. **Resource Protection**:
   - Firebase security rules restrict data access
   - User data isolation by ID

4. **Error Handling**:
   - Graceful handling of authentication failures
   - User-friendly error messages

## Usage in Components

Components can access authentication state and methods:

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, userData, logout } = useAuth();

  if (!user) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {userData?.displayName || user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```