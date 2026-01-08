
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Loader2, PhoneOff, AlertTriangle, 
  Check, Mic, MicOff, Video, VideoOff, 
  ArrowRight, Lock, Activity, Users, Settings2
} from 'lucide-react';
import { 
  StreamVideoClient, 
  StreamVideo, 
  StreamCall, 
  StreamTheme, 
  SpeakerLayout, 
  CallControls,
  CallParticipantsList,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';

// Safe environment variable access for Vite/ESM environments
const getApiKey = () => {
  try {
    return (import.meta as any).env?.VITE_STREAM_API_KEY || 'h6m4288m7v92';
  } catch (e) {
    return 'h6m4288m7v92';
  }
};

const STREAM_API_KEY = getApiKey();

const ConsultationRoom: React.FC = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialToken = searchParams.get('token');
  const initialCallType = searchParams.get('type') || 'default';

  const [currentUser, setCurrentUser] = useState(AuthService.getSession());
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState<'idle' | 'joining' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  const startSession = async () => {
    if (!expertId) return;

    setStatus('joining');
    setErrorMessage('');

    try {
      let token = initialToken;
      let callId = expertId;
      let callType = initialCallType;

      // Handle token acquisition for existing users/guests
      if (!token && currentUser) {
        const isGuest = currentUser.id.startsWith('guest_');
        // Check local API first
        const route = isGuest 
          ? `/meetings/adhoc/${expertId}/guest-token`
          : `/meetings/adhoc/${expertId}/token`;

        const res = await ApiService.request<any>(route, {
          method: isGuest ? 'POST' : 'GET',
          body: isGuest ? JSON.stringify({ userId: currentUser.id }) : undefined,
        });

        if (!res.success) throw new Error(res.message || "Security handshake failed.");

        token = res.data.token;
        if (res.data.callId) callId = res.data.callId;
      }

      if (!token) throw new Error("Access denied: No valid session token.");

      const decoded: any = jwtDecode(token);
      const streamUserId = decoded.user_id || currentUser?.id || 'unknown_member';

      const client = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: {
          id: streamUserId,
          name: currentUser?.name || "Premium Member",
        },
        token: token,
      });

      const call = client.call(callType, callId);
      
      // Attempt to join and create if it doesn't exist
      await call.join({ create: true });

      setVideoClient(client);
      setActiveCall(call);
      setStatus('connected');

    } catch (err: any) {
      console.error("Call Connection Failure:", err);
      setErrorMessage(err.message || "We encountered a network issue establishing the secure channel.");
      setStatus('error');
    }
  };

  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const guest = AuthService.setGuestSession(guestName.trim());
    setCurrentUser(guest);
  };

  useEffect(() => {
    if (currentUser || initialToken) {
      startSession();
    }

    return () => {
      videoClient?.disconnectUser();
    };
  }, [currentUser, initialToken, expertId]);

  // Entrance Guard
  if (!currentUser && !initialToken) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[200]">
        <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/5 p-12 text-center">
          <div className="w-20 h-20 bg-primary-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
            <Lock className="w-10 h-10 text-primary-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Secure Portal</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Verification required to join consultation</p>
          <form onSubmit={handleGuestJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Your Professional Name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Enter Session <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Error State Handler
  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 text-center z-[200]">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Connection Dropped</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
            {errorMessage}
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs transition-transform active:scale-95 shadow-2xl"
            >
              Re-establish Connection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between backdrop-blur-2xl bg-slate-950/50 z-20">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center border border-primary-500/20">
            <Shield className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.15em] text-white">
              {expertId?.split('-')[0]?.toUpperCase() || 'SECURE ROOM'}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                {currentUser?.name || 'Authorized Member'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowParticipants(!showParticipants)}
             className={`p-3 rounded-xl border transition-all ${showParticipants ? 'bg-primary-600/20 border-primary-500 text-primary-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
           >
             <Users className="w-5 h-5" />
           </button>
           <div className="h-6 w-px bg-white/5 mx-2"></div>
           <button 
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
           >
             Copy Link
           </button>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {status === 'joining' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50">
            <div className="relative mb-8">
               <Loader2 className="w-20 h-20 text-primary-500 animate-spin" />
               <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary-400 animate-pulse" />
            </div>
            <p className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2">Syncing Tunnel...</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">End-to-end encryption active</p>
          </div>
        )}

        {videoClient && activeCall && (
          <StreamVideo client={videoClient}>
            <StreamTheme className="flex-1 flex overflow-hidden">
              <StreamCall call={activeCall}>
                <div className="flex-1 flex flex-col relative">
                  <div className="flex-1 p-6 lg:p-12 flex items-center justify-center bg-black/20">
                    <div className="w-full h-full max-w-6xl mx-auto rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-900/40">
                      <SpeakerLayout participantsBarPosition="bottom" />
                    </div>
                  </div>
                  
                  {/* Modern Floating Controls */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
                     <CallControls onLeave={() => navigate('/dashboard')} />
                  </div>
                </div>

                {showParticipants && (
                  <div className="w-80 border-l border-white/5 bg-slate-900/50 backdrop-blur-3xl p-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-8">
                       <Users className="w-5 h-5 text-primary-500" />
                       <h3 className="text-xs font-black uppercase tracking-widest">Participants</h3>
                    </div>
                    {/* Fix: Added missing required onClose prop to CallParticipantsList */}
                    <CallParticipantsList onClose={() => setShowParticipants(false)} />
                  </div>
                )}
              </StreamCall>
            </StreamTheme>
          </StreamVideo>
        )}
      </main>

      <footer className="h-10 bg-slate-950 border-t border-white/5 flex items-center justify-center px-8">
        <div className="flex items-center gap-3 opacity-30">
          <Activity className="w-3 h-3 text-green-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Mesh Tunnel Active</span>
        </div>
      </footer>
    </div>
  );
};

export default ConsultationRoom;
