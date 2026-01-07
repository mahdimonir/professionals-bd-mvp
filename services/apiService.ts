
import { ApiResponse } from '../types';

// Detect environment and set base URL
const BASE_URL = 
  (import.meta as any).env?.VITE_BACKEND_URL || 
  (process.env as any).BACKEND_URL || 
  'https://serverprofessionalsbd.vercel.app/api/v1';

export class ApiService {
  static getBaseUrl() {
    return BASE_URL;
  }

  private static getHeaders() {
    const token = localStorage.getItem('probd_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
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
