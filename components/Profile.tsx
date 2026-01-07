
import React, { useMemo, useEffect, useState } from 'react';
import { User, Role, BookingStatus, Booking } from '../types';
import { Shield, Mail, MapPin, Calendar, Edit3, Camera, History, ExternalLink, Clock, Star, MessageCircle, Loader2 } from 'lucide-react';
import { ApiService } from '../services/apiService';

interface ProfileProps {
  user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await ApiService.get<Booking[]>('/bookings/my');
        if (response.success) setBookings(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-400">Please sign in to view your profile</h2>
      </div>
    );
  }

  const renderStatusBadge = (status: BookingStatus) => {
    const configs = {
      [BookingStatus.CONFIRMED]: 'bg-green-500/10 text-green-500 border-green-500/20',
      [BookingStatus.PENDING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      [BookingStatus.COMPLETED]: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
      [BookingStatus.CANCELLED]: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${configs[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="glass rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-600 relative">
          <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md text-white transition-all">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-12 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-8">
            <div className="relative">
              <img 
                src={user.avatar || 'https://via.placeholder.com/150'} 
                alt={user.name} 
                className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-950 object-cover shadow-2xl shadow-black/20"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-slate-950"></div>
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{user.name}</h1>
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full uppercase tracking-widest border border-primary-200 dark:border-primary-800">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{user.bio || 'Verified Member'}</p>
            </div>

            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">{user.location || 'Bangladesh'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600/10 p-2 rounded-xl border border-primary-500/20">
              <History className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Past Bookings & Reviews</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction logs</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading History...</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Review</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-slate-50 dark:hover:bg-primary-900/5 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {booking.professionalName}
                          </span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-5 text-center">
                        {renderStatusBadge(booking.status)}
                      </td>
                      <td className="py-5">
                        {booking.review ? (
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="text-xs font-black">{booking.review.rating}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">—</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">৳{booking.price.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-500 italic text-sm">
                      No booking history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
