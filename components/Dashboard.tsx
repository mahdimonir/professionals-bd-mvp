
import React, { useState, useEffect } from 'react';
import { 
  Video, AlertCircle, TrendingUp, DollarSign, ShieldAlert, BadgeCheck, 
  Loader2, Plus, LayoutDashboard, UserCheck, Activity, Search
} from 'lucide-react';
import { MOCK_PROFESSIONALS } from '../constants';
import { BookingStatus, User, Role, Booking } from '../types';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiService';

const Dashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'experts' | 'users' | 'revenue'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await ApiService.get<Booking[]>('/bookings/my');
        if (response.success) setBookings(response.data);
        
        if (user.role === Role.ADMIN || user.role === Role.MODERATOR) {
          const userRes = await ApiService.get<User[]>('/users');
          if (userRes.success) setAllUsers(userRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="p-20 text-center">Unauthorized.</div>;

  const isAdmin = user.role === Role.ADMIN || user.role === Role.MODERATOR;

  const renderAdminView = () => (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Command Center</h1>
          <p className="text-slate-500 font-medium">Platform-wide oversight and high-trust management.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-50 transition-all active:scale-95">
             <Activity className="w-4 h-4 text-primary-500" /> System Status
          </button>
          <button 
            onClick={() => navigate('/consultation/adhoc-internal')}
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-2xl shadow-primary-600/20 active:scale-95"
          >
            <Video className="w-4 h-4" /> Start Ad-hoc Channel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Growth', value: '+14%', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Verified Experts', value: MOCK_PROFESSIONALS.length.toString(), icon: UserCheck, color: 'text-primary-500' },
          { label: 'Security Alerts', value: '0', icon: ShieldAlert, color: 'text-amber-500' },
          { label: 'Platform Revenue', value: '৳2.4M', icon: DollarSign, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        {['overview', 'experts', 'users', 'revenue'].map(tab => (
           <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Recent System Activity</h2>
            <div className="space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-500" />
                       </div>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">New expert application submitted by Rafiqul Islam.</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">2 mins ago</span>
                 </div>
               ))}
            </div>
          </div>
        )}
        {activeTab === 'experts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Expert Directory</h2>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs" placeholder="Search experts..." />
              </div>
            </div>
            <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <th className="pb-4">Name</th>
                   <th className="pb-4">Category</th>
                   <th className="pb-4">Status</th>
                   <th className="pb-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {MOCK_PROFESSIONALS.map(p => (
                    <tr key={p.id} className="text-sm font-bold text-slate-900 dark:text-white">
                      <td className="py-4">{p.name}</td>
                      <td className="py-4">{p.category}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] rounded-full uppercase border border-green-500/20">Verified</span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-primary-600 hover:underline">Manage</button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserView = () => (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Consultations</h1>
        <button onClick={() => navigate('/professionals')} className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95">Find Expert</button>
      </div>
      
      <div className="space-y-4">
        {bookings.length > 0 ? bookings.map(b => (
          <div key={b.id} className="glass p-8 rounded-[2.5rem] flex items-center justify-between border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400">{new Date(b.startTime).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{new Date(b.startTime).getDate()}</span>
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{b.professionalName}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{new Date(b.startTime).toLocaleTimeString()} • ৳{b.price.toLocaleString()}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-primary-500/10 text-primary-500 border-primary-500/20">
                  {b.status}
               </span>
               {b.status === BookingStatus.CONFIRMED && (
                 <button onClick={() => navigate(`/consultation/${b.professionalId}`)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Join Room</button>
               )}
            </div>
          </div>
        )) : (
          <div className="py-32 text-center glass rounded-[3rem] border border-slate-200 dark:border-slate-800">
             <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No scheduled sessions</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      {isAdmin ? renderAdminView() : renderUserView()}
    </div>
  );
};

export default Dashboard;
