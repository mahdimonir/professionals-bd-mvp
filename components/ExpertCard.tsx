
import React, { useState } from 'react';
import { ProfessionalProfile, User } from '../types';
import { Star, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
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

  return (
    <div className="group relative glass border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <img 
              src={expert.avatar} 
              alt={expert.name} 
              className="w-16 h-16 rounded-xl object-cover border border-slate-700"
            />
            {expert.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border-2 border-slate-900">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-slate-200">{expert.rating}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {expert.name}
          </h3>
          <p className="text-sm text-slate-400 font-medium">
            {expert.specialties[0]}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {expert.specialties.slice(1).map((s, i) => (
            <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-slate-900 text-slate-500 px-2 py-1 rounded border border-slate-800">
              {s}
            </span>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{expert.experience} Yrs+ Exp</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Rate / hr</p>
              <p className="text-lg font-bold text-blue-400">৳{expert.rates.toLocaleString()}</p>
            </div>
          </div>
          
          <button 
            onClick={handleBook}
            disabled={isBooking}
            className="w-full bg-slate-800 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                Book Consultation
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
