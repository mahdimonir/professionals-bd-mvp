
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExpertCard from './components/ExpertCard';
import Dashboard from './components/Dashboard';
import ConsultationRoom from './components/ConsultationRoom';
import AIAssistant from './components/AIAssistant';
import Profile from './components/Profile';
import { MOCK_PROFESSIONALS } from './constants';
import { Search, SlidersHorizontal, Sparkles, Shield, Loader2, Check } from 'lucide-react';
import { AuthService } from './services/authService';
import { User, Role } from './types';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userJson = searchParams.get('user');

    if (accessToken && refreshToken && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        AuthService.saveSession({ accessToken, refreshToken, user });
        window.location.href = '/#/dashboard';
      } catch (err) {
        console.error('Failed to parse user data from callback', err);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Finalizing Security Handshake...</p>
    </div>
  );
};

const Marketplace: React.FC<{ 
  user: User | null; 
  searchTerm: string; 
  setSearchTerm: (s: string) => void;
  isScrolled: boolean;
}> = ({ user, searchTerm, setSearchTerm, isScrolled }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Legal', 'Financial', 'Medical', 'Tech'];

  const filteredExperts = MOCK_PROFESSIONALS.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !activeCategory || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary-600/10 text-primary-600 dark:text-primary-400 px-4 py-1.5 rounded-full border border-primary-600/20 mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">The Trusted Network for Bangladesh</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Find Your <span className="bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">Premium Expert</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Connect instantly with vetted legal, financial, and medical professionals. 
        </p>
        
        {!user && (
          <div className="pt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => AuthService.loginWithGoogle()}
              className="flex items-center gap-3 bg-white text-slate-900 border border-slate-200 px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl hover:shadow-primary-500/10 active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Hero-level Search & Filter Bar (Only visible when NOT scrolled) */}
      <div className={`transition-all duration-500 ${isScrolled ? 'opacity-0 scale-95 pointer-events-none h-0 mb-0' : 'opacity-100 scale-100 mb-12'}`}>
        <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search specialties (e.g. Corporate Law, Tax Advisory)..." 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all border h-full ${showFilters || activeCategory ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeCategory ? `Filter: ${activeCategory}` : 'Filters'}
            </button>

            {showFilters && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)}></div>
                <div className="absolute right-0 mt-2 w-64 glass border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-20 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Category</p>
                    {activeCategory && (
                      <button onClick={() => setActiveCategory(null)} className="text-[10px] text-primary-500 font-bold hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setShowFilters(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                      >
                        {cat}
                        {activeCategory === cat && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {filteredExperts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperts.map(expert => (
            <ExpertCard key={expert.id} expert={expert} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-3xl border border-slate-200 dark:border-slate-800">
           <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-black uppercase tracking-widest">No matching experts found</p>
           <button onClick={() => { setSearchTerm(''); setActiveCategory(null); }} className="mt-4 text-primary-500 font-bold hover:underline">Reset all filters</button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(AuthService.getSession());
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-white text-slate-900 light';
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      // Transition point for the docked search bar
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    AuthService.clearSession();
    setUser(null);
    window.location.hash = '/';
  };

  const handleRoleChange = async (role: Role) => {
    try {
      const updatedUser = await AuthService.switchRole(role);
      setUser({...updatedUser});
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onRoleChange={handleRoleChange} 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isScrolled={isScrolled}
        />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Marketplace user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} isScrolled={isScrolled} />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/consultation/:expertId" element={<ConsultationRoom />} />
          </Routes>
        </main>
        
        <AIAssistant />

        <footer className="py-12 border-t border-slate-200 dark:border-slate-900 glass-dark">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="font-black text-slate-900 dark:text-white">ProfessionalsBD</span>
            </div>
            <p className="text-xs text-slate-500">© 2026 ProfessionalsBD. Premium High-Trust Expert Network.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
