import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define TypeScript interfaces
interface User {
  username: string;
  email: string;
  password: string; // In production, passwords should be hashed
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create AuthContext with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props interface for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Initialize mock users (for testing purposes)
const initializeMockUsers = () => {
  const mockUsers: User[] = [
    {
      username: 'clayton.reynolds',
      email: 'clayton.reynolds@example.com',
      password: 'Green@7581', // In production, use hashed passwords
      status: 'active',
    },
    {
      username: 'prathamesh.tare',
      email: 'prathamesh.tare@example.com',
      password: 'Green@7581',
      status: 'active',
    },
    {
      username: 'lavinia.reynolds',
      email: 'lavinia.reynolds@example.com',
      password: 'Green@7581',
      status: 'active',
    },
  ];

  // Only initialize if users don't already exist in localStorage
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user state from localStorage on mount
  useEffect(() => {
    // Initialize mock users
    initializeMockUsers();

    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to load user from localStorage:', err);
      setError('Failed to initialize authentication state');
    }
  }, []);

  // Login function
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      setError(null); // Clear previous errors
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(
        (u: User) => (u.email === emailOrUsername || u.username === emailOrUsername) && u.status === 'active'
      );

      if (!foundUser) {
        setError('User not found or account is inactive');
        return false;
      }

      if (foundUser.password !== password) {
        setError('Invalid password');
        return false;
      }

      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem('currentUser');
    } catch (err) {
      console.error('Logout error:', err);
      setError('An error occurred during logout');
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {error && <div role="alert">{error}</div>}
      {children}
    </AuthContext.Provider>
  );
};