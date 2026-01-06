
import React, { useState } from 'react';
import { ProfessionalProfile, User, AvailabilityStatus } from '../types';
import { Star, CheckCircle, Clock, ArrowRight, Loader2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  expert: ProfessionalProfile;
  user: User | null;
}

const ExpertCard: React.FC<Props> = ({ expert, user }) => {
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = async () => {
    if (!user) {
      alert("Please sign in to book a consultation.");
      return;
    }

    setIsBooking(true);
    try {
      // Create a mock booking window (1 hour from now)
      const startTime = new Date(Date.now() + 3600000).toISOString();
      const endTime = new Date(Date.now() + 7200000).toISOString();

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          professionalId: expert.id,
          startTime,
          endTime,
          price: expert.rates
        })
      });

      if (!response.ok) throw new Error('Booking failed');

      // Success - Proceed to consultation room
      navigate(`/consultation/${expert.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong with your booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
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
    <div className="group relative glass border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-500 hover:border-primary-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <img 
                src={expert.avatar} 
                alt={expert.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {expert.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-primary-600 rounded-full p-1 border-2 border-white dark:border-slate-950 shadow-lg">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-current ${statusConfig.pulse ? 'animate-pulse' : ''}`}></div>
              <span className="text-[10px] font-black uppercase tracking-wider">{expert.status || 'Offline'}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{expert.rating}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {expert.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {expert.specialties[0]}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {expert.specialties.slice(1, 3).map((s, i) => (
            <span key={i} className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              {s}
            </span>
          ))}
          {expert.specialties.length > 3 && (
            <span className="text-[10px] font-bold text-primary-500 py-1">+{expert.specialties.length - 3} more</span>
          )}
        </div>

        <div className="space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-bold">{expert.experience} Yrs+ Experience</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Circle className="w-1.5 h-1.5 fill-slate-300 dark:fill-slate-700 ml-1.5" />
                <span className="text-[10px] uppercase tracking-tight font-medium">{expert.languages.join(', ')}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-0.5">Rate per Hour</p>
              <p className="text-xl font-black text-primary-600 dark:text-primary-400">৳{expert.rates.toLocaleString()}</p>
            </div>
          </div>
          
          <button 
            onClick={handleBook}
            disabled={isBooking}
            className="w-full bg-slate-900 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg shadow-primary-600/10 active:scale-95"
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Booking...
              </>
            ) : (
              <>
                Book Instant Consultation
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
