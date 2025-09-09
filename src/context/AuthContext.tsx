import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize mock users if not present in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const mockUsers = [
        { username: 'clayton.reynolds', email: 'clayton@example.com', password: 'Green@7581', status: 'active', role: 'admin' },
        { username: 'prathamesh.tare', email: 'prathamesh@example.com', password: 'Green@7581', status: 'active', role: 'employee' },
        { username: 'lavinia.reynolds', email: 'lavinia@example.com', password: 'Green@7581', status: 'active', role: 'employee' },
      ];
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }

    // Check for stored user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; role?: string }> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User) => 
      (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    );
    
    if (foundUser && foundUser.status === 'active') {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return { success: true, role: foundUser.role };
    }
    
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};