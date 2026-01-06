
import React from 'react';
import { User, Role } from '../types';
import { Shield, Mail, MapPin, Calendar, Edit3, Camera } from 'lucide-react';

interface ProfileProps {
  user: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-400">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="glass rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-600 relative">
          <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md text-white transition-all">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
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
              <p className="text-slate-500 dark:text-slate-400 font-medium">{user.bio || 'Bangladeshi Professional'}</p>
            </div>

            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span>{user.location || 'Dhaka, Bangladesh'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>Joined March 2024</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">About</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dedicated {user.role.toLowerCase()} on ProfessionalsBD platform. Committed to high-quality standards and professional growth within the expert network.
                </p>
              </section>
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-black text-primary-600 dark:text-primary-400">12</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Bookings</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">4.8</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
