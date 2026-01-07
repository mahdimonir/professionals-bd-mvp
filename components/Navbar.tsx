import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, User as UserIcon, LogOut, LayoutDashboard, 
  ChevronDown, Sun, Moon, UserCircle, Settings, ShieldCheck,
  Terminal, Zap, Search as SearchIcon
} from 'lucide-react';
import { User, Role } from '../types';
import { AuthService } from '../services/authService';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRoleChange: (role: Role) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, onLogout, theme, onToggleTheme, onRoleChange,
  searchTerm, setSearchTerm, isScrolled 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);

  const handleRoleSwitch = (role: Role) => {
    onRoleChange(role);
    setShowDevMenu(false);
    navigate('/dashboard');
  };

  return (
    <nav className="sticky top-0 z-[60] w-full glass-dark border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Pro<span className="text-primary-600">BD</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Integrated Navbar Search (Shows only on scroll) */}
          <div className={`flex-1 max-w-md mx-8 transition-all duration-500 ${isScrolled && location.pathname === '/' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find an expert..." 
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Dev Role Switcher */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setShowDevMenu(!showDevMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showDevMenu ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-primary-500'}`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Dev Role</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showDevMenu ? 'rotate-180' : ''}`} />
              </button>

              {showDevMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDevMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 glass border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Switch Identity</p>
                    </div>
                    {Object.values(Role).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleSwitch(r)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 ${user?.role === r ? 'text-primary-600 bg-primary-50/50 dark:bg-primary-900/10' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        {r}
                        {user?.role === r && <Zap className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-primary-500 transition-all border border-slate-200 dark:border-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 p-1 pr-3 rounded-full transition-all group"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-white transition-colors">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 glass border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <Link 
                        to="/profile" 
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link 
                        to="/dashboard" 
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => AuthService.loginWithGoogle()}
                className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;