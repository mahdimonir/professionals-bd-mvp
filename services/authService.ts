import { jwtDecode } from 'jwt-decode';
import { User, Role } from '../types';

const CLIENT_ID = "706428108170-paotqhuo5545llhr8h56c3o7i005okse.apps.googleusercontent.com";
const STORAGE_KEY = 'probid_user_session';

export class AuthService {
  static initGoogleSignIn(callback: (user: User) => void) {
    if (typeof window === 'undefined' || !(window as any).google) return;

    try {
      (window as any).google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: any) => {
          const decoded: any = jwtDecode(response.credential);
          
          // Mocking role assignment for demo purposes: 
          let role = Role.USER;
          if (decoded.email.includes('admin')) role = Role.ADMIN;
          else if (decoded.email.includes('pro')) role = Role.PROFESSIONAL;
          else if (decoded.email.includes('mod')) role = Role.MODERATOR;

          const user: User = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            avatar: decoded.picture,
            role: role,
            isVerified: decoded.email_verified
          };
          this.saveSession(user);
          callback(user);
        },
        auto_select: false,
        use_fedcm_for_prompt: false, // Disables the modern FedCM prompt causing NotAllowedError
        itp_support: true,
        context: 'signin'
      });

      if (!this.getSession()) {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap prompt not displayed:', notification.getNotDisplayedReason());
          }
        });
      }
    } catch (err) {
      console.error('Failed to initialize Google Sign-In:', err);
    }
  }

  static renderButton(elementId: string) {
    const el = document.getElementById(elementId);
    if (typeof window === 'undefined' || !(window as any).google || !el) return;
    
    (window as any).google.accounts.id.renderButton(
      el,
      { 
        theme: 'outline', 
        size: 'large', 
        shape: 'pill',
        text: 'signin_with',
        width: 280,
        logo_alignment: 'left'
      }
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
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  }
}