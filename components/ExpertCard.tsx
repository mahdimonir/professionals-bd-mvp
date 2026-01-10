
import React, { useState } from 'react';
import { ProfessionalProfile, User, AvailabilityStatus, Booking } from '../types';
import { Star, CheckCircle, Clock, ArrowRight, Loader2, Circle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiService';

interface Props {
  expert: ProfessionalProfile;
  user: User | null;
}

const ExpertCard: React.FC<Props> = ({ expert, user }) => {
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/professionals/${expert.id}`);
  };

  const getStatusConfig = (status?: AvailabilityStatus) => {
    switch (status) {
      case 'Available Now':
        return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', pulse: true };
      case 'Busy':
        return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', pulse: false };
      case 'Offline':
        return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', pulse: false };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', pulse: false };
    }
  };

  const statusConfig = getStatusConfig(expert.status);

  return (
    <div 
      onClick={() => navigate(`/professionals/${expert.id}`)}
      className="group relative glass border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-primary-500/50 hover:shadow-[0_40px_80px_rgba(59,130,246,0.12)] cursor-pointer"
    >
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-700">
              <img 
                src={expert.avatar} 
                alt={expert.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {expert.isVerified && (
              <div className="absolute -bottom-3 -right-3 bg-primary-600 rounded-2xl p-2 border-4 border-white dark:border-slate-950 shadow-xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
              <div className={`w-2 h-2 rounded-full bg-current ${statusConfig.pulse ? 'animate-pulse' : ''}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest">{expert.status || 'Offline'}</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{expert.rating}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5 font-black uppercase tracking-widest">({expert.reviewCount} reviews)</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors tracking-tight">
            {expert.name}
          </h3>
          <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">
            {expert.category} Specialist
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {expert.specialties.map((s, i) => (
            <span key={i} className="text-[9px] uppercase tracking-widest font-black bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {s}
            </span>
          ))}
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock className="w-5 h-5 text-primary-500" />
              <span className="text-xs font-black uppercase tracking-widest">{expert.experience} Years Hub</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Session Rate</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ৳{expert.rates.toLocaleString()}
                <span className="text-[10px] text-slate-400 ml-1 font-bold">/ 60M</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleBook}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-5 rounded-3xl text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white shadow-xl active:scale-95 group/btn"
          >
            Initiate Consultation
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
