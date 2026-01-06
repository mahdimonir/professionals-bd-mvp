import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, User as UserIcon, LogOut, LayoutDashboard, 
  ChevronDown, Sun, Moon, UserCircle, Settings, ShieldCheck,
  Terminal, Zap, ShieldAlert
} from 'lucide-react';
import { User, Role } from '../types';
import { AuthService } from '../services/authService';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRoleChange: (role: Role) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, theme, onToggleTheme, onRoleChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = (role: Role) => {
    onRoleChange(role);
    setShowDevMenu(false);
    navigate('/dashboard'); // Jump to dashboard to see changes
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-dark border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Professionals<span className="text-primary-600">BD</span>
                </span>
                {user && (
                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">
                    [{user.role} MODE]
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary-500 ${isActive('/') ? 'text-primary-600' : 'text-slate-500'}`}
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary-500 ${isActive('/dashboard') ? 'text-primary-600' : 'text-slate-500'}`}
            >
              Dashboard
            </Link>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center gap-2">
              {/* DEV ROLE SWITCHER - ALWAYS VISIBLE */}
              <div className="relative">
                <button 
                  onClick={() => setShowDevMenu(!showDevMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showDevMenu ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-primary-500'}`}
                >
                  <Terminal className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dev Role</span>
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
            </div>

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
              <div id="google-signin-nav"></div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
             <button onClick={() => setShowDevMenu(!showDevMenu)} className="p-2 text-primary-500">
                <Terminal className="w-5 h-5" />
             </button>
             <button onClick={onToggleTheme} className="p-2 text-slate-500">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             {user && (
               <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="w-8 h-8 rounded-full border border-slate-700 overflow-hidden">
                 <img src={user.avatar} className="w-full h-full" />
               </button>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;