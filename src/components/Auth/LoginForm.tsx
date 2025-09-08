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
      username: 'prathmesh.tare',
      email: 'prathmesh.tare@example.com',
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
}; and loginpage.tsx  import React, { useState } from 'react';
import { Building, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(formData.emailOrUsername, formData.password);
      if (success) {
        navigate('/dashboard'); // Redirect to dashboard on successful login
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const setDemoCredentials = (username: string, password: string) => {
    setFormData({ emailOrUsername: username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-700">Green Earth Spaces</h1>
              <p className="text-gray-600 mt-2">CRM System Login</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    type="text"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email or username"
                    aria-describedby={authError ? 'error-message' : undefined}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                    aria-describedby={authError ? 'error-message' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div
                  id="error-message"
                  className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg"
                  role="alert"
                >
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Login Credentials:</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('clayton.reynolds', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
                aria-label="Use admin credentials: clayton.reynolds"
              >
                👤 Admin: clayton.reynolds
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('prathmesh.tare', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
                aria-label="Use user credentials: prathmesh.tare"
              >
                👤 User: prathmesh.tare
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('lavinia.reynolds', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
                aria-label="Use user credentials: lavinia.reynolds"
              >
                👤 User: lavinia.reynolds
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;