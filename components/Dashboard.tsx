
import React, { useState, useEffect } from 'react';
import { 
  Video, AlertCircle, TrendingUp, DollarSign, ShieldAlert, BadgeCheck, 
  Loader2, Plus, LogOut, LayoutDashboard, ChevronRight
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
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  
  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<{expertId: string, reason: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

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

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      // 1. Create ad-hoc meeting
      const res = await ApiService.post<any>('/meetings/adhoc', { 
        title: "Office Meeting"
      });
      
      if (res.success) {
        // Handle both possible structures: res.data.callId or res.data.id
        const callId = res.data.callId || res.data.id;

        // 2. Get join token for current user
        const tokenRes = await ApiService.get<any>(`/meetings/adhoc/${callId}/token`);
        
        if (tokenRes.success) {
          const token = tokenRes.data.token;
          // 3. Join the call by navigating to Consultation Room with the token
          navigate(`/consultation/${callId}?token=${token}`);
        } else {
          // If token fails, attempt navigation anyway (maybe it's a public room)
          navigate(`/consultation/${callId}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create ad-hoc meeting room.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

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

  const renderManagementView = () => (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {user.role === Role.ADMIN ? 'Platform Administration' : 'Moderator Dashboard'}
          </h1>
          <p className="text-slate-500 font-medium">Platform oversight and high-trust management.</p>
        </div>
        <button 
          onClick={handleCreateRoom}
          disabled={isCreatingRoom}
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
        >
          {isCreatingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Launch Ad-hoc Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Capacity', value: '94%', icon: BadgeCheck, color: 'text-primary-500' },
          { label: 'Active Channels', value: '12', icon: Video, color: 'text-green-500' },
          { label: 'Trust Alerts', value: '0', icon: ShieldAlert, color: 'text-amber-500' },
          { label: 'System Health', value: 'Optimal', icon: TrendingUp, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
      
      <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Real-time Platform Logs</h2>
          <div className="text-center py-12 text-slate-500 italic text-sm">
              All cryptographic sessions are active. No anomalies detected.
          </div>
      </div>
    </div>
  );

  const renderUserView = () => (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex gap-6">
          <button onClick={() => setActiveTab('active')} className={`text-xs font-black uppercase tracking-widest pb-4 -mb-4 border-b-2 transition-all ${activeTab === 'active' ? 'text-primary-600 border-primary-600' : 'text-slate-400 border-transparent'}`}>Upcoming</button>
          <button onClick={() => setActiveTab('history')} className={`text-xs font-black uppercase tracking-widest pb-4 -mb-4 border-b-2 transition-all ${activeTab === 'history' ? 'text-primary-600 border-primary-600' : 'text-slate-400 border-transparent'}`}>History</button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Data...</p>
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
                    <button onClick={() => navigate(`/consultation/${b.professionalId}`)} className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20">
                      <Video className="w-4 h-4" /> Start Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          
          {bookings.filter(b => activeTab === 'active' ? b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED : b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED).length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm italic">
                  Your record is currently clear.
              </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {(user.role === Role.ADMIN || user.role === Role.MODERATOR) ? renderManagementView() : renderUserView()}
    </div>
  );
};

export default Dashboard;
