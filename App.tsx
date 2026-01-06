
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExpertCard from './components/ExpertCard';
import Dashboard from './components/Dashboard';
import ConsultationRoom from './components/ConsultationRoom';
import AIAssistant from './components/AIAssistant';
import { MOCK_PROFESSIONALS } from './constants';
import { Search, SlidersHorizontal, Sparkles, Shield, LogIn } from 'lucide-react';
import { AuthService } from './services/authService';
import { User } from './types';

const Marketplace: React.FC<{ user: User | null }> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredExperts = MOCK_PROFESSIONALS.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-600/20 mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">The Trusted Network for Bangladesh</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Find Your <span className="bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Premium Expert</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
          Connect instantly with vetted legal, financial, and medical professionals. 
          Secure consultations powered by cutting-edge Gemini AI.
        </p>
        
        {!user && (
          <div className="pt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-500">Sign in to book consultations</p>
            <div id="google-signin-hero"></div>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 sticky top-20 z-40 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search specialties (e.g. Corporate Law, Tax Advisory)..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 px-8 py-4 rounded-2xl hover:bg-slate-800 transition-colors font-bold">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExperts.map(expert => (
          <ExpertCard key={expert.id} expert={expert} user={user} />
        ))}
      </div>
      
      {filteredExperts.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-xl">No professionals found matching "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className="text-blue-500 hover:underline mt-2">Clear search</button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(AuthService.getSession());

  useEffect(() => {
    // Wait for GSI to be available
    const interval = setInterval(() => {
      if ((window as any).google) {
        clearInterval(interval);
        AuthService.initGoogleSignIn((u) => setUser(u));
        if (!user) {
          AuthService.renderButton('google-signin-hero');
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    AuthService.clearSession();
    setUser(null);
    window.location.reload();
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Marketplace user={user} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/consultation/:expertId" element={<ConsultationRoom />} />
          </Routes>
        </main>
        
        {/* Floating AI Support */}
        <AIAssistant />

        <footer className="py-12 border-t border-slate-900 glass-dark">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-white">ProfessionalsBD</span>
            </div>
            <div className="text-sm text-slate-500 flex gap-8">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>
            <p className="text-xs text-slate-600">© 2024 ProfessionalsBD. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
