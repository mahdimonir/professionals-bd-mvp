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
        use_fedcm_for_prompt: false,
        itp_support: true,
        context: 'signin'
      });

      if (!this.getSession()) {
        (window as any).google.accounts.id.prompt();
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

  static switchRole(role: Role) {
    let user = this.getSession();
    
    // If no session exists, create a mock one for testing
    if (!user) {
      user = {
        id: 'mock-dev-id',
        name: `Dev ${role.charAt(0) + role.slice(1).toLowerCase()}`,
        email: `dev-${role.toLowerCase()}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
        role: role,
        isVerified: true,
        bio: `This is a mock account for ${role} role testing.`
      };
    } else {
      user.role = role;
    }
    
    this.saveSession(user);
    return user;
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