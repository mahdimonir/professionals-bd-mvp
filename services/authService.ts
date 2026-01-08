
import { User, Role, AuthResponse } from '../types';
import { ApiService } from './apiService';

const STORAGE_USER_KEY = 'probd_user';
const STORAGE_ACCESS_TOKEN = 'probd_access_token';
const STORAGE_REFRESH_TOKEN = 'probd_refresh_token';

export class AuthService {
  static loginWithGoogle() {
    const baseUrl = ApiService.getBaseUrl();
    window.location.href = `${baseUrl}/auth/google`;
  }

  static async register(data: any) {
    return ApiService.post<any>('/auth/register', data);
  }

  static async verifyOtp(email: string, otp: string) {
    const response = await ApiService.post<AuthResponse>('/auth/register/verify', { email, otp });
    if (response.success) {
      this.saveSession(response.data);
    }
    return response;
  }

  static async login(data: any) {
    const response = await ApiService.post<AuthResponse>('/auth/login', data);
    if (response.success) {
      this.saveSession(response.data);
    }
    return response;
  }

  static saveSession(authData: AuthResponse) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authData.user));
    localStorage.setItem(STORAGE_ACCESS_TOKEN, authData.accessToken);
    localStorage.setItem(STORAGE_REFRESH_TOKEN, authData.refreshToken);
  }

  static setGuestSession(name: string) {
    const guestUser: User = {
      id: `guest_${Math.random().toString(36).substr(2, 9)}`,
      name: `${name} (Guest)`,
      email: 'guest@probd.com',
      role: Role.USER,
      isVerified: false,
      avatar: `https://i.pravatar.cc/150?u=${name}`
    };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(guestUser));
    return guestUser;
  }

  static getSession(): User | null {
    const data = localStorage.getItem(STORAGE_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static clearSession() {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN);
  }

  static async switchRole(role: Role): Promise<User> {
    const user = this.getSession();
    if (!user) throw new Error('No session');
    const updatedUser = { ...user, role };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
}
