
import React from 'react';
import { Calendar, Clock, Video, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { MOCK_BOOKINGS } from '../constants';
import { BookingStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Quick Stats */}
        <div className="w-full md:w-64 space-y-4">
          <div className="glass p-6 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Account</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">4</p>
                  <p className="text-[10px] text-slate-500 uppercase">Total Sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">12h</p>
                  <p className="text-[10px] text-slate-500 uppercase">Hours Guided</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bookings */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Upcoming Consultations</h1>
            <span className="text-xs font-medium text-slate-500">{MOCK_BOOKINGS.length} sessions scheduled</span>
          </div>

          <div className="space-y-4">
            {MOCK_BOOKINGS.map(booking => {
              const startDate = new Date(booking.startTime);
              const isJoinable = booking.status === BookingStatus.CONFIRMED;

              return (
                <div key={booking.id} className="glass p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 font-bold">
                        <span className="text-xs">{startDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-sm">{startDate.getDate()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{booking.professionalName}</h3>
                        <div className="flex items-center gap-3 text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                          <span className="font-medium text-blue-400">৳{booking.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === BookingStatus.CONFIRMED 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {booking.status}
                      </div>
                      
                      {isJoinable && (
                        <button 
                          onClick={() => navigate(`/consultation/${booking.professionalId}`)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                          <Video className="w-4 h-4" />
                          Join Now
                        </button>
                      )}

                      <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {MOCK_BOOKINGS.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>No upcoming sessions found.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-400 hover:underline text-sm font-bold">
                  Browse experts
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
