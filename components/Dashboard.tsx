
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, Video, FileText, ChevronRight, AlertCircle, 
  Users, TrendingUp, DollarSign, ShieldAlert, BadgeCheck, MessageSquare,
  Zap, Hash, ArrowRight, Trash2, Ban, CheckCircle2, XCircle, Search,
  Filter, MoreVertical, LayoutGrid, List as ListIcon, History, Settings,
  Circle, Sparkles, BrainCircuit, Info, Loader2
} from 'lucide-react';
import { MOCK_PROFESSIONALS } from '../constants';
import { BookingStatus, User, Role, Booking } from '../types';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/geminiService';
import { ApiService } from '../services/apiService';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'analytics' | 'management'>('active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<{expertId: string, reason: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Professional specific state
  const [isProfessionalOnline, setIsProfessionalOnline] = useState(true);
  const [slots, setSlots] = useState({ morning: true, afternoon: false, evening: true });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await ApiService.get<Booking[]>('/bookings/my');
        if (response.success) {
          setBookings(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch bookings', err);
        // Fallback to empty or previous if needed
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Fetch AI recommendations for regular users
  useEffect(() => {
    const fetchAiMatches = async () => {
      if (user?.role === Role.USER && bookings.length > 0) {
        setIsAiLoading(true);
        const gemini = new GeminiService();
        const data = await gemini.getExpertRecommendations(bookings, MOCK_PROFESSIONALS);
        setRecommendations(data.recommendations || []);
        setIsAiLoading(false);
      }
    };
    fetchAiMatches();
  }, [user, bookings]);

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-slate-400">Please sign in to access your dashboard.</h1>
    </div>
  );

  const renderStatusBadge = (status: BookingStatus) => {
    const configs = {
      [BookingStatus.CONFIRMED]: 'bg-green-500/10 text-green-500 border-green-500/20',
      [BookingStatus.PENDING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      [BookingStatus.COMPLETED]: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
      [BookingStatus.CANCELLED]: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${configs[status]}`}>
        {status}
      </span>
    );
  };

  const renderAiRecommendations = () => {
    if (user.role !== Role.USER) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Smart Expert Matches</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI analysis of your needs</p>
            </div>
          </div>
        </div>

        {isAiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 glass rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse bg-slate-100 dark:bg-slate-900"></div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const expert = MOCK_PROFESSIONALS.find(e => e.id === rec.expertId);
              if (!expert) return null;
              return (
                <div key={expert.id} className="group relative glass p-5 rounded-3xl border border-indigo-500/30 dark:border-indigo-500/20 hover:border-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/10 overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={expert.avatar} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800" alt={expert.name} />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{expert.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{expert.specialties[0]}</p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-500/5 dark:bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/10 mb-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 italic">
                        "{rec.reason}"
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/consultation/${expert.id}`)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    View Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
            <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Book your first session to receive personalized expert recommendations.</p>
          </div>
        )}
      </div>
    );
  };

  const renderUserView = () => (
    <div className="space-y-12">
      {renderAiRecommendations()}

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab('active')} className={`text-xs font-black uppercase tracking-widest pb-4 -mb-4 border-b-2 transition-all ${activeTab === 'active' ? 'text-primary-600 border-primary-600' : 'text-slate-400 border-transparent'}`}>Upcoming Sessions</button>
            <button onClick={() => setActiveTab('history')} className={`text-xs font-black uppercase tracking-widest pb-4 -mb-4 border-b-2 transition-all ${activeTab === 'history' ? 'text-primary-600 border-primary-600' : 'text-slate-400 border-transparent'}`}>Consultation History</button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Encrypted Records...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings
              .filter(b => activeTab === 'active' ? b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED : b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED)
              .map(b => (
                <div key={b.id} className="glass p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center font-black">
                      <span className="text-[10px] text-slate-400 uppercase">{new Date(b.startTime).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-sm text-slate-900 dark:text-white">{new Date(b.startTime).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{b.professionalName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStatusBadge(b.status)}
                        <span className="text-xs text-slate-500 font-medium">৳{b.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.status === BookingStatus.CONFIRMED && (
                      <button onClick={() => navigate(`/consultation/${b.professionalId}`)} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20">
                        <Video className="w-4 h-4" /> Join Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {bookings.filter(b => activeTab === 'active' ? b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED : b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED).length === 0 && (
                <div className="py-20 text-center glass rounded-3xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 font-medium italic">No sessions found in this category.</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {user.role === Role.USER ? renderUserView() : (
        <div className="py-20 text-center">
          <p className="text-slate-500 italic">Dashboard views for {user.role} are coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
