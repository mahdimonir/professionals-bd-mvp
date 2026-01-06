
import React from 'react';
import { 
  Calendar, Clock, Video, FileText, ChevronRight, AlertCircle, 
  Users, TrendingUp, DollarSign, ShieldAlert, BadgeCheck, MessageSquare 
} from 'lucide-react';
import { MOCK_BOOKINGS } from '../constants';
import { BookingStatus, User, Role } from '../types';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-slate-400">Please sign in to access your dashboard.</h1>
    </div>
  );

  const renderClientDashboard = () => (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left: Quick Stats */}
      <div className="w-full md:w-64 space-y-4">
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">My Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">4</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Sessions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">12h</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Hours Guided</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Bookings */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Upcoming Consultations</h1>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{MOCK_BOOKINGS.length} sessions</span>
        </div>

        <div className="space-y-4">
          {MOCK_BOOKINGS.map(booking => {
            const startDate = new Date(booking.startTime);
            const isJoinable = booking.status === BookingStatus.CONFIRMED;

            return (
              <div key={booking.id} className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all group shadow-sm hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 font-black">
                      <span className="text-[10px] uppercase">{startDate.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-sm">{startDate.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{booking.professionalName}</h3>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">৳{booking.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === BookingStatus.CONFIRMED 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {booking.status}
                    </div>
                    
                    {isJoinable && (
                      <button 
                        onClick={() => navigate(`/consultation/${booking.professionalId}`)}
                        className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-black px-5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary-600/30"
                      >
                        <Video className="w-4 h-4" />
                        Join Now
                      </button>
                    )}

                    <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProfessionalDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Earnings</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">৳84,200</h2>
            </div>
          </div>
          <p className="text-xs text-green-500 font-bold">+12% from last month</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Bookings</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">8</h2>
            </div>
          </div>
          <p className="text-xs text-primary-500 font-bold">3 new requests pending</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Client Reviews</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">4.9/5.0</h2>
            </div>
          </div>
          <p className="text-xs text-yellow-500 font-bold">Based on 32 reviews</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Manage Schedule</h2>
          <button className="text-primary-600 dark:text-primary-400 text-sm font-bold flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-8 h-8 rounded-full" />
                    <span className="font-bold text-slate-900 dark:text-white">Client Name {i+1}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Oct 24, 2024 • 10:00 AM</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">Corporate IP Advice</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">Confirmed</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-primary-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase">Join</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', val: '1,240', icon: Users, color: 'primary' },
          { label: 'Active Experts', val: '156', icon: BadgeCheck, color: 'green' },
          { label: 'Monthly Revenue', val: '৳420k', icon: DollarSign, color: 'blue' },
          { label: 'Platform Health', val: '99.9%', icon: TrendingUp, color: 'indigo' }
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <stat.icon className={`w-6 h-6 text-${stat.color}-500 mb-4`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.val}</h2>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">User Management</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/150?u=u${i}`} className="w-10 h-10 rounded-xl" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">System User {i}</p>
                    <p className="text-xs text-slate-500">user{i}@probid.com</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Audit Logs</h2>
          <div className="space-y-4">
             {[1,2,3].map((_, i) => (
               <div key={i} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                 <div className="w-1 bg-primary-500 rounded-full h-10"></div>
                 <div>
                   <p className="text-xs text-slate-500 font-bold mb-1">2 mins ago</p>
                   <p className="text-sm text-slate-700 dark:text-slate-300">New expert <strong>Adv. Rahman</strong> verified by Moderator J.</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeratorDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Moderation Hub</h1>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">3 Alerts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <BadgeCheck className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Verification Requests</h2>
          </div>
          <div className="space-y-4">
            {[1, 2].map((_, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img src={`https://i.pravatar.cc/150?u=req${i}`} className="w-12 h-12 rounded-2xl" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Expert Applicant {i+1}</h3>
                    <p className="text-xs text-slate-500">Legal Specialist • Dhaka</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary-600 text-white py-2 rounded-xl font-bold text-xs">Review Docs</button>
                  <button className="px-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-2 rounded-xl font-bold text-xs">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Dispute Resolution</h2>
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase text-red-500 tracking-widest bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">High Priority</span>
                <span className="text-xs text-slate-500">1 hour ago</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Booking #B-23910 Issue</p>
              <p className="text-xs text-slate-500 leading-relaxed">Client claims expert did not show up for session. Checking logs...</p>
              <button className="mt-4 w-full border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all">Open Case</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {user.role === Role.USER && renderClientDashboard()}
      {user.role === Role.PROFESSIONAL && renderProfessionalDashboard()}
      {user.role === Role.ADMIN && renderAdminDashboard()}
      {user.role === Role.MODERATOR && renderModeratorDashboard()}
    </div>
  );
};

export default Dashboard;
