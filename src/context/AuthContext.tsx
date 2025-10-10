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

  // Initialize users in localStorage if not exists
  useEffect(() => {
    const initializeUsers = () => {
      if (!localStorage.getItem('users')) {
        const users: User[] = [
          {
            id: '1',
            name: 'Clayton Reynolds',
            username: 'clayton.reynolds',
            password: 'Green@7581',
            email: 'clayton@greenearthspaces.com',
            mobileNo: '9876543210',
            role: 'admin',
            status: 'active',
            createdAt: '2024-01-01',
          },
          {
            id: '2',
            name: 'Prathmesh Tare',
            username: 'prathmesh.tare',
            password: 'Green@7581',
            email: 'prathmesh@greenearthspaces.com', 
            mobileNo: '9876543211',
            role: 'employee',
            status: 'active',
            createdAt: '2024-01-02',
          },
          {
            id: '3',
            name: 'Lavinia Reynolds',
            username: 'lavinia.reynolds',
            password: 'Green@7581',
            email: 'lavinia@greenearthspaces.com',
            mobileNo: '9876543212',
            role: 'employee',
            status: 'active',
            createdAt: '2024-01-03',
          },
        ];
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Users initialized in AuthContext:', users); // Debug log
      }
    };

    initializeUsers();

    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt:', { username, password }); // Debug log
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('Available users:', users); // Debug log
      const foundUser = users.find((u: User) => 
        u.username === username && u.password === password && u.status === 'active'
      );
      console.log('Found user:', foundUser); // Debug log

      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};