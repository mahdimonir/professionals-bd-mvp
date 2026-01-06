
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, User as UserIcon, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass-dark border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                ProfessionalsBD
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${isActive('/') ? 'text-blue-500' : 'text-slate-400'}`}
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${isActive('/dashboard') ? 'text-blue-500' : 'text-slate-400'}`}
            >
              Dashboard
            </Link>
            <div className="h-4 w-px bg-slate-800"></div>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 p-1.5 pr-3 rounded-full transition-all group"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-700" />
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 glass-dark border border-slate-700 rounded-2xl shadow-2xl py-2 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-slate-800 mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      </div>
                      <Link 
                        to="/dashboard" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                      </Link>
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

          <div className="md:hidden">
            <button className="text-slate-400 hover:text-white">
              <Shield className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
