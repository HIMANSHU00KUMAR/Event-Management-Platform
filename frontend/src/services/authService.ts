import api from '../axios';
import { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  // Login
  Userlogin: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  UserRegister: async (data: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Guest login
  guestLogin: async (): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/guest');
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};