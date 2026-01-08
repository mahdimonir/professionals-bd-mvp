
import { ApiResponse } from '../types';

// Using relative path to trigger Vercel Proxy (configured in vercel.json)
const BASE_URL = '/api';

export class ApiService {
  static getBaseUrl() {
    return BASE_URL;
  }

  private static getHeaders() {
    const token = localStorage.getItem('probd_access_token');
    const userJson = localStorage.getItem('probd_user');
    const user = userJson ? JSON.parse(userJson) : null;

    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-user-id': user ? user.id : '',
    };
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      // Some backends return 200 OK but a custom success flag inside
      if (!response.ok || (data.success === false)) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }
      
      return data as ApiResponse<T>;
    } catch (err: any) {
      console.error(`API Request Failed [${endpoint}]:`, err);
      throw err;
    }
  }

  static async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async patch<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}
