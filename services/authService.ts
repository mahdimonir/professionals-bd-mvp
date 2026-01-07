
import { User, Role, AuthResponse } from '../types';
import { ApiService } from './apiService';

const STORAGE_USER_KEY = 'probd_user';
const STORAGE_ACCESS_TOKEN = 'probd_access_token';
const STORAGE_REFRESH_TOKEN = 'probd_refresh_token';

export class AuthService {
  static async loginWithGoogle() {
    // Redirect flow handled by the backend
    window.location.href = 'https://server.professionalsbd.vercel.app/api/v1/auth/google';
  }

  static saveSession(authData: AuthResponse) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authData.user));
    localStorage.setItem(STORAGE_ACCESS_TOKEN, authData.accessToken);
    localStorage.setItem(STORAGE_REFRESH_TOKEN, authData.refreshToken);
  }

  static getSession(): User | null {
    const data = localStorage.getItem(STORAGE_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_ACCESS_TOKEN);
  }

  static clearSession() {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN);
  }

  static async switchRole(role: Role): Promise<User> {
    const user = this.getSession();
    if (!user) throw new Error('No session');
    
    // In a real app, this would be a PATCH to /users/me/profile
    // For this prototype, we simulate it
    const updatedUser = { ...user, role };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
}
