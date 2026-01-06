
import { jwtDecode } from 'jwt-decode';
import { User, Role } from '../types';

const CLIENT_ID = "706428108170-paotqhuo5545llhr8h56c3o7i005okse.apps.googleusercontent.com";
const STORAGE_KEY = 'probid_user_session';

export class AuthService {
  static initGoogleSignIn(callback: (user: User) => void) {
    if (typeof window === 'undefined' || !(window as any).google) return;

    (window as any).google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: any) => {
        const decoded: any = jwtDecode(response.credential);
        const user: User = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.picture,
          role: Role.USER, // Default role for new sign-ins
          isVerified: decoded.email_verified
        };
        this.saveSession(user);
        callback(user);
      },
      auto_select: true
    });

    (window as any).google.accounts.id.prompt();
  }

  static renderButton(elementId: string) {
    if (typeof window === 'undefined' || !(window as any).google) return;
    (window as any).google.accounts.id.renderButton(
      document.getElementById(elementId),
      { theme: 'outline', size: 'large', shape: 'pill' }
    );
  }

  static saveSession(user: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  static getSession(): User | null {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  static clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
