import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing token and user data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.Userlogin(email, password);
      setUser(userData.user);
      // Store token and user data in localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const guestLogin = async () => {
    try {
      const guestData = await authService.guestLogin();
      setUser(guestData.user);
      // Store guest token and user data
      localStorage.setItem('token', guestData.token);
      localStorage.setItem('user', JSON.stringify(guestData.user));
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};