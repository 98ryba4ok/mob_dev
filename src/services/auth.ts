import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  totalScore: number;
  gamesWon: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'user';

  async register(username: string, email: string, password: string): Promise<void> {
    const response = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.token && response.user) {
      await this.saveAuthData(response.token, response.user);
    } else {
      throw new Error('Registration failed');
    }
  }

  async login(username: string, password: string): Promise<void> {
    const response = await apiRequest<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.token && response.user) {
      await this.saveAuthData(response.token, response.user);
    } else {
      throw new Error('Login failed');
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(this.tokenKey);
    await AsyncStorage.removeItem(this.userKey);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.userKey);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(this.tokenKey);
    return !!token;
  }

  private async saveAuthData(token: string, user: User): Promise<void> {
    await AsyncStorage.setItem(this.tokenKey, token);
    await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();

