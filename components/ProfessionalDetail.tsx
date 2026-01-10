
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROFESSIONALS } from '../constants';
import { Shield, Star, Clock, Globe, MapPin, GraduationCap, ArrowRight, Loader2, CreditCard, Award, Calendar, ChevronRight } from 'lucide-react';
import { User, BookingStatus, Booking } from '../types';
import { ApiService } from '../services/apiService';

const ProfessionalDetail: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState<'info' | 'booking' | 'payment'>('info');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const expert = MOCK_PROFESSIONALS.find(p => p.id === id);

  if (!expert) return <div className="p-40 text-center">Expert profile not found.</div>;

  const slots = [
    "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"
  ];

  const handleBookingStart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setStep('booking');
  };

  const processPayment = async (method: 'bKash' | 'SSLCommerz') => {
    setIsBooking(true);
    try {
      const startTime = new Date(Date.now() + 3600000).toISOString();
      const endTime = new Date(Date.now() + 7200000).toISOString();

      const response = await ApiService.post<Booking>('/bookings/', {
        professionalId: expert.id,
        startTime,
        endTime,
        price: expert.rates
      });

      if (response.success) {
        setTimeout(() => {
          navigate(`/profile?tab=bookings&new=${response.data.id}`);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Transaction failed. System busy.");
      setIsBooking(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-16">
            {/* Hero Card */}
            <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
              <div className="relative group">
                <img 
                  src={expert.avatar} 
                  className="w-48 h-48 rounded-[3rem] object-cover border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105" 
                  alt={expert.name}
                />
                <div className="absolute -bottom-4 -right-4 bg-primary-600 p-2.5 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{expert.name}</h1>
                  {expert.isVerified && <Shield className="w-8 h-8 text-primary-500" />}
                </div>
                <p className="text-2xl font-black text-primary-600 uppercase tracking-tight">{expert.specialties.join(' • ')}</p>
                <div className="flex flex-wrap gap-6 text-slate-500 font-bold text-sm">
                  <div className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> {expert.rating} / 5.0</div>
                  <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary-500" /> {expert.experience} Years of Trust</div>
                  <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-500" /> {expert.location}</div>
                </div>
              </div>
            </div>

            {/* Content Tabs area simulated as sections */}
            <div className="space-y-12">
              <section className="glass p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Expertise & Background</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {expert.bio}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 mt-10 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Academic Foundation</h4>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-600/10 rounded-xl border border-primary-500/20">
                          <GraduationCap className="w-5 h-5 text-primary-500" />
                        </div>
                        <span className="font-black text-slate-900 dark:text-white text-sm uppercase">{expert.education}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Linguistic Reach</h4>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                          <Globe className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="font-black text-slate-900 dark:text-white text-sm uppercase">{expert.languages.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Professional Credentials</h4>
                    <div className="space-y-3">
                      {expert.certifications?.map((cert, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <Award className="w-4 h-4 text-primary-500" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-4">Client Feedback</h3>
                <div className="space-y-6">
                  {expert.reviews?.map(review => (
                    <div key={review.id} className="glass p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-black text-white">{review.userName[0]}</div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{review.userName}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />)}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Sticky Action Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 glass rounded-[3.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield className="w-32 h-32" />
              </div>

              {step === 'info' && (
                <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Session Rate</p>
                      <p className="text-5xl font-black text-slate-900 dark:text-white">৳{expert.rates.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">Available</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Consultation Duration</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">60 MINS</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Session Quality</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase">HD 4K VIDEO</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleBookingStart}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-6 rounded-3xl text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                  >
                    Initiate Booking <ChevronRight className="w-4 h-4" />
                  </button>

                  <p className="text-[9px] text-center text-slate-500 uppercase font-black tracking-widest leading-relaxed">
                    Vetted Professional • High Trust Node • Secure Channel
                  </p>
                </div>
              )}

              {step === 'booking' && (
                <div className="space-y-8 animate-in slide-in-from-right-8">
                  <button onClick={() => setStep('info')} className="text-[10px] font-black uppercase text-slate-400 hover:text-primary-600 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Change Expert
                  </button>
                  
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-primary-500" /> Select Time
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {slots.map(slot => (
                        <button 
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 rounded-2xl border-2 font-black text-xs transition-all ${selectedSlot === slot ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary-500'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-primary-600/5 rounded-2xl border border-primary-500/10 space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Session Total</span>
                        <span className="text-slate-900 dark:text-white">৳{expert.rates.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={!selectedSlot}
                    onClick={() => setStep('payment')}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-black py-6 rounded-3xl text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Confirm & Proceed <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-8 animate-in slide-in-from-right-8">
                  <button onClick={() => setStep('booking')} className="text-[10px] font-black uppercase text-slate-400 hover:text-primary-600 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Change Time
                  </button>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Checkout</h3>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => processPayment('bKash')}
                        disabled={isBooking}
                        className="w-full flex items-center justify-between p-5 bg-[#E2136E]/5 border-2 border-[#E2136E]/10 rounded-3xl hover:bg-[#E2136E]/10 transition-all group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-4">
                          <img src="https://logos-world.net/wp-content/uploads/2022/11/BKash-Logo-700x394.png" className="w-10 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" alt="bKash" />
                          <span className="font-black text-sm uppercase text-slate-700 dark:text-slate-300">bKash FastPay</span>
                        </div>
                        {isBooking ? <Loader2 className="w-4 h-4 animate-spin text-[#E2136E]" /> : <ChevronRight className="w-4 h-4 text-[#E2136E]" />}
                      </button>

                      <button 
                        onClick={() => processPayment('SSLCommerz')}
                        disabled={isBooking}
                        className="w-full flex items-center justify-between p-5 bg-blue-600/5 border-2 border-blue-500/10 rounded-3xl hover:bg-blue-600/10 transition-all group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8 text-blue-600/50 group-hover:text-blue-600 transition-all" />
                          <span className="font-black text-sm uppercase text-slate-700 dark:text-slate-300">Card / SSLCommerz</span>
                        </div>
                        {isBooking ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <ChevronRight className="w-4 h-4 text-blue-600" />}
                      </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Summary</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Service Fee</span>
                          <span>৳0</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                          <span>Payable Amount</span>
                          <span>৳{expert.rates.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-center text-slate-500 uppercase font-black tracking-widest leading-relaxed">
                    Encrypted Gateway • Zero Storage Policy • Bank Grade Auth
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetail;
