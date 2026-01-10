
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExpertCard from './components/ExpertCard';
import Dashboard from './components/Dashboard';
import ConsultationRoom from './components/ConsultationRoom';
import AIAssistant from './components/AIAssistant';
import Profile from './components/Profile';
import Auth from './components/Auth';
import StaticPages from './components/StaticPages';
import ProfessionalDetail from './components/ProfessionalDetail';
import ProfessionalList from './components/ProfessionalList';
import { MOCK_PROFESSIONALS, TESTIMONIALS } from './constants';
import { Search, Sparkles, Shield, ArrowRight, Zap, Target, Award, Users, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { AuthService } from './services/authService';
import { User, Role } from './types';

const Homepage: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section - Matching User Screenshot */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
          {/* Badge from Screenshot */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-5 py-2 rounded-full border border-blue-100 dark:border-blue-800 animate-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Trusted Network for Bangladesh</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] max-w-4xl mx-auto">
            Find Your <span className="text-primary-600">Premium Expert</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Connect instantly with vetted legal, financial, and medical professionals.
          </p>

          {/* Unified Search Bar - Matching User Screenshot */}
          <div className="max-w-4xl mx-auto w-full pt-8 px-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-2 shadow-xl flex flex-col md:flex-row items-center transition-all focus-within:ring-4 focus-within:ring-primary-500/5 group">
              <div className="flex-1 flex items-center px-4 w-full">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search specialties (e.g. Corporate Law, Tax Advisory)..." 
                  className="w-full pl-4 pr-4 py-5 bg-transparent outline-none text-slate-800 dark:text-white font-medium text-base placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/professionals?q=${searchTerm}`)}
                />
              </div>
              <button 
                onClick={() => navigate('/professionals')}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 font-bold text-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">Featured Specialists</h2>
              <p className="text-slate-500 font-medium">Hand-picked professionals for immediate high-trust sessions.</p>
            </div>
            <Link to="/professionals" className="flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
              See Full Network <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_PROFESSIONALS.slice(0, 3).map(expert => (
              <ExpertCard key={expert.id} expert={expert} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* Rest of components... (simplified for brevity) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">The Trust Loop</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Our three-step framework for professional resolution in Bangladesh.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-100 dark:bg-slate-800 z-0"></div>
            {[
              { icon: Search, title: "1. Vetting", desc: "Every expert is audited for credentials and professional ethics before joining." },
              { icon: Zap, title: "2. Handshake", desc: "Select a high-fidelity time slot or connect instantly for urgent matters." },
              { icon: Shield, title: "3. Resolution", desc: "Engage in end-to-end encrypted calls. Your privacy is our priority." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-8 shadow-xl group-hover:border-primary-500 transition-all group-hover:-translate-y-2">
                  <step.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[250px] font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 text-left">
              <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                Trusted by the <br/> <span className="text-primary-600">Expert Class</span>
              </h2>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: Target, label: "Platform Uptime", val: "99.9%" },
                  { icon: Award, label: "Verified Sectors", val: "10+" },
                  { icon: Users, label: "Client Success", val: "10k+" },
                  { icon: Shield, label: "E2E Secured", val: "100%" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <stat.icon className="w-5 h-5 text-primary-500 mb-3" />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {TESTIMONIALS.map(t => (
                <div key={t.id} className="glass p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl flex gap-6 items-start hover:-translate-y-1 transition-all">
                  <img src={t.avatar} className="w-14 h-14 rounded-2xl border-2 border-white/10" alt={t.name} />
                  <div className="text-left">
                    <p className="text-slate-600 dark:text-slate-300 italic mb-4 text-sm leading-relaxed font-medium">"{t.content}"</p>
                    <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-widest">{t.name}</h4>
                    <p className="text-[9px] text-primary-600 font-black uppercase mt-1">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto bg-primary-600 rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-30"></div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-10 leading-tight relative z-10">
            Professional Access. <br/> Zero Friction.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-white text-primary-600 px-12 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              Sign Up for Free
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto bg-primary-700/50 text-white border-2 border-white/20 px-12 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-95"
            >
              Talk to Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(AuthService.getSession());
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  const isConsultation = location.pathname.startsWith('/consultation/');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-white text-slate-900 light';
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
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

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen flex flex-col">
      {!isConsultation && (
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onRoleChange={handleRoleChange} 
          isScrolled={isScrolled}
        />
      )}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Homepage user={user} />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/consultation/:expertId" element={<ConsultationRoom />} />
          <Route path="/professionals" element={<ProfessionalList />} />
          <Route path="/professionals/:id" element={<ProfessionalDetail user={user} />} />
          <Route path="/about" element={<StaticPages.About />} />
          <Route path="/contact" element={<StaticPages.Contact />} />
          <Route path="/terms" element={<StaticPages.Terms />} />
          <Route path="/policy" element={<StaticPages.Policy />} />
        </Routes>
      </main>
      
      {!isConsultation && <AIAssistant />}

      {!isConsultation && (
        <footer className="py-24 border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-6 text-left">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary-600" />
                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter">ProfessionalsBD</span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                The high-trust expert network platform for the Bangladeshi digital economy.
              </p>
            </div>
            {['Network', 'Platform', 'Legal'].map((group, idx) => (
              <div key={idx} className="text-left">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{group}</h4>
                <ul className="space-y-4">
                  <li><Link to="/professionals" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Find Experts</Link></li>
                  <li><Link to="/about" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">How it Works</Link></li>
                  <li><Link to="/contact" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Corporate Support</Link></li>
                  <li><Link to="/terms" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Legal Terms</Link></li>
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-24 pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">© 2026 ProfessionalsBD Network. Dhaka Hub.</p>
            <div className="flex gap-8">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure TLS 1.3</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ISO 27001 Certified</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
