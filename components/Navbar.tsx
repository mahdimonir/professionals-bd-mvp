
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, User as UserIcon, LogOut, LayoutDashboard, 
  ChevronDown, Sun, Moon, UserCircle 
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, theme, onToggleTheme }) => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass-dark border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Professionals<span className="text-primary-600">BD</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary-500 ${isActive('/') ? 'text-primary-600' : 'text-slate-500'}`}
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary-500 ${isActive('/dashboard') ? 'text-primary-600' : 'text-slate-500'}`}
            >
              Dashboard
            </Link>
            
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-primary-500 transition-all border border-slate-200 dark:border-slate-800"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 p-1.5 pr-3 rounded-full transition-all group"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-white transition-colors">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 glass border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl py-3 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                        <p className="text-[9px] font-black text-primary-600 uppercase mt-1">{user.role}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link 
                        to="/dashboard" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div id="google-signin-nav"></div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
             <button onClick={onToggleTheme} className="p-2 text-slate-500">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
            <button className="text-slate-600 dark:text-slate-400 hover:text-primary-500">
              <Shield className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
