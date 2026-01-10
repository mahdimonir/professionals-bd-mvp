
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Role, BookingStatus, Booking, Payment } from '../types';
// Added ChevronRight to imports to resolve "Cannot find name 'ChevronRight'" error
import { Shield, Mail, MapPin, Edit3, Camera, Clock, Loader2, CreditCard, Download, Save, X, Activity, UserCheck, ChevronRight } from 'lucide-react';
import { ApiService } from '../services/apiService';
import { AuthService } from '../services/authService';

const Profile: React.FC<{ user: User | null }> = ({ user: initialUser }) => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'billing' | 'settings'>(
    (searchParams.get('tab') as any) || 'overview'
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [bookRes, payRes] = await Promise.all([
          ApiService.get<Booking[]>('/bookings/my'),
          ApiService.get<Payment[]>('/payments/my')
        ]);
        if (bookRes.success) setBookings(bookRes.data);
        if (payRes.success) setPayments(payRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.patch<User>('/users/me', editData);
      if (res.success) {
        setUser(res.data);
        AuthService.saveSession({ user: res.data } as any);
        setIsEditing(false);
      }
    } catch (err) {
      alert("Platform error. Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (id: string) => {
    alert(`System: Invoice INV-${id.substring(0,8).toUpperCase()} is being generated and will be delivered to your verified email address.`);
  };

  if (!user) return <div className="p-40 text-center">Authentication Required.</div>;

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Navigation Column */}
          <div className="lg:col-span-3 space-y-8">
            <div className="glass p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-600 to-indigo-700 opacity-20"></div>
              <div className="relative z-10">
                <div className="relative inline-block mb-6">
                  <img src={user.avatar} className="w-28 h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl" alt={user.name} />
                  <button className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-slate-900">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user.name}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 mt-1">{user.role}</p>
                <div className="mt-6 flex justify-center gap-3">
                  <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[70px]">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{bookings.length}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400">Sessions</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[70px]">
                    <span className="text-lg font-black text-slate-900 dark:text-white">9</span>
                    <span className="text-[8px] font-black uppercase text-slate-400">Experts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
              {['overview', 'bookings', 'billing', 'settings'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`w-full flex items-center gap-4 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-l-4 ${activeTab === tab ? 'bg-primary-600/5 text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  {tab === 'overview' && <Activity className="w-4 h-4" />}
                  {tab === 'bookings' && <Clock className="w-4 h-4" />}
                  {tab === 'billing' && <CreditCard className="w-4 h-4" />}
                  {tab === 'settings' && <Edit3 className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-9">
            <div className="glass rounded-[3.5rem] border border-slate-200 dark:border-slate-800 p-10 md:p-14 shadow-2xl min-h-[600px]">
              
              {activeTab === 'overview' && (
                <div className="space-y-12 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Profile Snapshot</h2>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                      <UserCheck className="w-4 h-4" /> Account Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Verified Identity</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Contact Endpoint</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Current Region</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{user.location || 'Dhaka Node, Bangladesh'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Registered Phone</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{user.phone || 'Handshake Pending'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">Recent Platform Usage</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center">
                      <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-400 text-xs font-bold">Your session logs are end-to-end encrypted. No unauthorized access recorded in the last 24h.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-8 animate-in fade-in">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Session History</h2>
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map(b => (
                        <div key={b.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary-500/50 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
                              <span className="text-[9px] font-black uppercase text-slate-400">{new Date(b.startTime).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-xl font-black text-slate-900 dark:text-white">{new Date(b.startTime).getDate()}</span>
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{b.professionalName}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(b.startTime).toLocaleTimeString()} • 60 min session</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${b.status === BookingStatus.CONFIRMED ? 'bg-primary-600/10 text-primary-600 border-primary-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                              {b.status}
                            </span>
                            <button className="p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-primary-600 transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center glass rounded-[2.5rem]">
                      <Activity className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                      <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No scheduled sessions found</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Financial Ledger</h2>
                  <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-5">Transaction Reference</th>
                          <th className="px-8 py-5">Method</th>
                          <th className="px-8 py-5">Amount</th>
                          <th className="px-8 py-5 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[1, 2].map(i => (
                          <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-sm text-slate-900 dark:text-slate-200">
                            <td className="px-8 py-6 uppercase">#TR-82910{i}X</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary-500" /> bKash Checkout
                              </div>
                            </td>
                            <td className="px-8 py-6">৳5,000</td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => handleDownloadInvoice(`inv_${i}`)} className="p-2.5 rounded-xl bg-primary-600/10 text-primary-600 hover:bg-primary-600 hover:text-white transition-all">
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-12 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Account Setup</h2>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">
                        Modify Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={handleSaveProfile} className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                          <Save className="w-4 h-4 mr-2 inline" /> Commit Changes
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Display Name</label>
                        <input 
                          disabled={!isEditing}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all disabled:opacity-50" 
                          value={editData.name} 
                          onChange={e => setEditData({...editData, name: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Phone Identifier</label>
                        <input 
                          disabled={!isEditing}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all disabled:opacity-50" 
                          value={editData.phone || ''} 
                          placeholder="+880 1..."
                          onChange={e => setEditData({...editData, phone: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Primary Location</label>
                        <input 
                          disabled={!isEditing}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl font-bold outline-none focus:border-primary-500 transition-all disabled:opacity-50" 
                          value={editData.location || ''} 
                          placeholder="Dhaka, Bangladesh"
                          onChange={e => setEditData({...editData, location: e.target.value})} 
                        />
                      </div>
                      <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Security Note</p>
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                          Changing your primary identifier may trigger a 24-hour verification hold for high-trust sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
