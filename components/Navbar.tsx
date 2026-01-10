
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, LogOut, LayoutDashboard, 
  ChevronDown, Sun, Moon, UserCircle
} from 'lucide-react';
import { User, Role } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRoleChange: (role: Role) => void;
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, onLogout, theme, onToggleTheme, isScrolled 
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <nav className={`fixed top-0 z-[60] w-full transition-all duration-300 ${isScrolled ? 'glass-dark py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-12 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-xl group-hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20 group-hover:rotate-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-black tracking-tight transition-colors ${theme === 'dark' || isScrolled ? 'text-white' : 'text-slate-900'}`}>
                Pro<span className="text-primary-600">BD</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Experts', 'About', 'Contact'].map(item => (
                <Link 
                  key={item} 
                  to={`/${item.toLowerCase()}`} 
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${theme === 'dark' || isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-primary-600'}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={onToggleTheme}
              className={`p-2.5 rounded-full transition-all border ${theme === 'dark' || isScrolled ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'} hover:scale-110`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all group ${theme === 'dark' || isScrolled ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
                  <span className={`text-xs font-bold transition-colors ${theme === 'dark' || isScrolled ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-primary-600'}`}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 glass-dark border border-white/10 rounded-3xl shadow-2xl py-3 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <Link to="/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                        <UserCircle className="w-4 h-4 text-primary-500" /> Account Settings
                      </Link>
                      <Link to="/dashboard" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                        <LayoutDashboard className="w-4 h-4 text-primary-500" /> Control Center
                      </Link>
                      <div className="h-px bg-white/5 my-2 mx-4"></div>
                      <button onClick={onLogout} className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4 h-4" /> Secure Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-colors ${theme === 'dark' || isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-primary-600'}`}>Sign In</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-500 text-white px-7 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-600/30 hover:-translate-y-0.5 active:scale-95">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
