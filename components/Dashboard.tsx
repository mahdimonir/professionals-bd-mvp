import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, Video, FileText, ChevronRight, AlertCircle, 
  Users, TrendingUp, DollarSign, ShieldAlert, BadgeCheck, MessageSquare,
  Zap, Hash, ArrowRight, Trash2, Ban, CheckCircle2, XCircle, Search,
  Filter, MoreVertical, LayoutGrid, List as ListIcon, History, Settings,
  Circle, Sparkles, BrainCircuit, Info
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_PROFESSIONALS, MOCK_USERS } from '../constants';
import { BookingStatus, User, Role, ProfessionalProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/geminiService';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'analytics' | 'management'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<{expertId: string, reason: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Professional specific state
  const [isProfessionalOnline, setIsProfessionalOnline] = useState(true);
  const [slots, setSlots] = useState({ morning: true, afternoon: false, evening: true });

  const filteredBookings = useMemo(() => {
    if (!user) return [];
    if (user.role === Role.USER) return MOCK_BOOKINGS.filter(b => b.userId === user.id);
    if (user.role === Role.PROFESSIONAL) return MOCK_BOOKINGS.filter(b => b.professionalId === 'p1');
    return MOCK_BOOKINGS;
  }, [user]);

  // Fetch AI recommendations for regular users
  useEffect(() => {
    const fetchAiMatches = async () => {
      if (user?.role === Role.USER && filteredBookings.length > 0) {
        setIsAiLoading(true);
        const gemini = new GeminiService();
        const data = await gemini.getExpertRecommendations(filteredBookings, MOCK_PROFESSIONALS);
        setRecommendations(data.recommendations || []);
        setIsAiLoading(false);
      }
    };
    fetchAiMatches();
  }, [user, filteredBookings]);

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

  // --- AI RECOMMENDATIONS SECTION ---
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
          {isAiLoading && (
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Generating insights...</span>
             </div>
          )}
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

  // --- ROLE: USER DASHBOARD ---
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

        <div className="space-y-4">
          {filteredBookings
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
                  {b.status === BookingStatus.COMPLETED && (
                    <button className="text-slate-500 hover:text-primary-600 transition-colors p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredBookings.filter(b => activeTab === 'active' ? b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED : b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED).length === 0 && (
              <div className="py-20 text-center glass rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 font-medium italic">No sessions found in this category.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );

  // --- ROLE: PROFESSIONAL DASHBOARD ---
  const renderProfessionalView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Earnings</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">৳124,500</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Minutes</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">1,420</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Active Sessions</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">4</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">Live Status</span>
            <button onClick={() => setIsProfessionalOnline(!isProfessionalOnline)} className={`w-10 h-5 rounded-full relative transition-all ${isProfessionalOnline ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isProfessionalOnline ? 'right-0.5' : 'left-0.5'}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            My Schedule
          </h2>
          <div className="space-y-3">
            {filteredBookings.map(b => (
              <div key={b.id} className="glass p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{b.userName || 'Client User'}</p>
                  <p className="text-[10px] text-slate-500">{new Date(b.startTime).toLocaleTimeString()} • 60 mins</p>
                </div>
                {renderStatusBadge(b.status)}
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary-500" />
            Availability Blocks
          </h3>
          <div className="space-y-4">
            {Object.entries(slots).map(([key, val]) => (
              <button key={key} onClick={() => setSlots({...slots, [key]: !val})} className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${val ? 'bg-primary-600/10 border-primary-500 text-primary-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                <span className="text-xs font-bold capitalize">{key}</span>
                {val ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- ROLE: MODERATOR DASHBOARD ---
  const renderModeratorView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Operations Control</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs focus:border-primary-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 font-black uppercase text-slate-500">Booking ID</th>
              <th className="p-4 font-black uppercase text-slate-500">Client</th>
              <th className="p-4 font-black uppercase text-slate-500">Expert</th>
              <th className="p-4 font-black uppercase text-slate-500">Status</th>
              <th className="p-4 font-black uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {MOCK_BOOKINGS.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-primary-900/5 transition-colors">
                <td className="p-4 font-mono text-slate-500">#{b.id}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{b.userName || 'Client'}</td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">{b.professionalName}</td>
                <td className="p-4">{renderStatusBadge(b.status)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:text-primary-600 transition-colors" title="Force Confirm">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:text-red-600 transition-colors" title="Force Cancel">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- ROLE: ADMIN COMMAND CENTER ---
  const renderAdminView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg bg-gradient-to-br from-primary-600/5 to-indigo-600/5">
          <TrendingUp className="w-6 h-6 text-primary-500 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">System Health</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">99.98%</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <Users className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Verified</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">124</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <ShieldAlert className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Open Disputes</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">2</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <DollarSign className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Platform Revenue</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">৳2.4M</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-primary-500" />
            Verification Queue
          </h2>
          <div className="space-y-4">
            {MOCK_PROFESSIONALS.filter(p => !p.isApproved).map(p => (
              <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.avatar} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{p.specialties[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-500 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                  <button className="bg-slate-200 dark:bg-slate-800 text-slate-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><XCircle className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500 text-center italic">All experts currently verified.</p>
          </div>
        </div>

        {/* User Management */}
        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-500" />
            System Accounts
          </h2>
          <div className="space-y-4">
            {MOCK_USERS.map(u => (
              <div key={u.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{u.name}</p>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{u.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-1.5 hover:text-amber-500 transition-colors" title="Suspend"><Ban className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {user.role === Role.USER && renderUserView()}
      {user.role === Role.PROFESSIONAL && renderProfessionalView()}
      {user.role === Role.MODERATOR && renderModeratorView()}
      {user.role === Role.ADMIN && renderAdminView()}
    </div>
  );
};

export default Dashboard;