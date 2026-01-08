
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Loader2, PhoneOff, AlertTriangle, 
  Check, ArrowRight, Lock, Activity, Users, UserPlus, CircleStop, Circle
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
  useCall,
} from '@stream-io/video-react-sdk';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';

// Safe environment variable access
const getApiKey = () => {
  try {
    return (import.meta as any).env?.VITE_STREAM_API_KEY || 'h6m4288m7v92';
  } catch (e) {
    return 'h6m4288m7v92';
  }
};

const STREAM_API_KEY = getApiKey();

// Recording Controls Component
const RecordingControls = () => {
  // Fix: Removed useCallRecording as it's not part of useCallStateHooks. 
  // Added useCall to access start/stop recording methods directly.
  const call = useCall();
  const { useIsCallRecordingInProgress, useLocalParticipant } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const localParticipant = useLocalParticipant();

  // Fix: Changed 'role' to 'roles' (array of strings) and used .includes() to correctly check participant permissions.
  const canRecord = localParticipant?.roles?.includes('admin') || localParticipant?.roles?.includes('host');

  if (!canRecord || !call) return null;

  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <button
          onClick={() => call.stopRecording()}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <CircleStop className="w-4 h-4 animate-pulse" />
          Stop Recording
        </button>
      ) : (
        <button
          onClick={() => call.startRecording()}
          className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
        >
          <Circle className="w-4 h-4 text-red-500 fill-red-500" />
          Start Recording
        </button>
      )}
    </div>
  );
};

// Premium Invite Button
const InviteExpertButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${
        copied 
          ? 'bg-green-600 text-white' 
          : 'bg-primary-600 hover:bg-primary-500 text-white'
      }`}
    >
      {copied ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {copied ? 'Link Copied' : 'Invite Guest'}
    </button>
  );
};

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

      if (!token && currentUser) {
        const isGuest = currentUser.id.startsWith('guest_');
        const route = isGuest 
          ? `/meetings/adhoc/${expertId}/guest-token`
          : `/meetings/adhoc/${expertId}/token`;

        const res = await ApiService.request<any>(route, {
          method: isGuest ? 'POST' : 'GET',
          body: isGuest ? JSON.stringify({ userId: currentUser.id }) : undefined,
        });

        if (!res.success) throw new Error(res.message || "Session verification failed.");
        token = res.data.token;
        if (res.data.callId) callId = res.data.callId;
      }

      if (!token) throw new Error("No secure token provided.");

      const decoded: any = jwtDecode(token);
      const streamUserId = decoded.user_id || currentUser?.id || 'guest_member';

      const client = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: {
          id: streamUserId,
          name: currentUser?.name || "Premium Member",
        },
        token: token,
      });

      const call = client.call(callType, callId);
      await call.join({ create: true });

      setVideoClient(client);
      setActiveCall(call);
      setStatus('connected');
    } catch (err: any) {
      console.error("Consultation Connection Error:", err);
      setErrorMessage(err.message || "Secure tunnel could not be established.");
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

  // Gatekeeping for unauthorized access
  if (!currentUser && !initialToken) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[300]">
        <div className="max-w-md w-full bg-slate-900 border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-primary-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
            <Lock className="w-10 h-10 text-primary-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Private Session</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Verification required to join encrypted feed</p>
          <form onSubmit={handleGuestJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Your Professional Identity"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-slate-600 outline-none focus:border-primary-500 transition-all"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              Join Secure Channel <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Handle errors immersive
  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 z-[300]">
        <div className="max-sm text-center">
          <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Handshake Failed</h2>
          <p className="text-slate-400 text-sm mb-12 leading-relaxed">{errorMessage}</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => window.location.reload()} className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl uppercase text-xs tracking-widest active:scale-95 shadow-2xl">Retry Connection</button>
            <button onClick={() => navigate('/dashboard')} className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">Return to Safety</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col overflow-hidden z-[100]">
      {videoClient && activeCall ? (
        <StreamVideo client={videoClient}>
          <StreamCall call={activeCall}>
            <StreamTheme className="flex-1 flex flex-col overflow-hidden">
              {/* Immersive Consultation Header - Now inside StreamCall to support hooks in RecordingControls */}
              <header className="h-24 border-b border-white/5 px-10 flex items-center justify-between backdrop-blur-3xl bg-slate-950/40 relative z-50">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary-600/10 rounded-[1.5rem] flex items-center justify-center border border-primary-500/20">
                    <Shield className="w-7 h-7 text-primary-500" />
                  </div>
                  <div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em]">
                      {expertId?.split('-')[0]?.toUpperCase() || 'PRIVATE'} Consultation
                    </h1>
                    <div className="flex items-center gap-2 mt-1 opacity-50">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Authorized Session</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-5">
                   <RecordingControls />
                   <div className="h-10 w-px bg-white/10 mx-2"></div>
                   <InviteExpertButton />
                   <button 
                     onClick={() => setShowParticipants(!showParticipants)}
                     className={`p-4 rounded-2xl border transition-all ${showParticipants ? 'bg-primary-600 text-white border-primary-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                   >
                     <Users className="w-5 h-5" />
                   </button>
                </div>
              </header>

              <main className="flex-1 relative flex overflow-hidden">
                <div className="flex-1 flex flex-col relative bg-black/40">
                  <div className="flex-1 p-6 lg:p-12">
                    <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-900/20 relative">
                      <SpeakerLayout participantsBarPosition="bottom" />
                    </div>
                  </div>
                  
                  {/* Modern Floating Call Controls */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 scale-125">
                     <CallControls onLeave={() => navigate('/dashboard')} />
                  </div>
                </div>

                {showParticipants && (
                  <div className="w-96 border-l border-white/5 bg-slate-950/80 backdrop-blur-3xl p-8 animate-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center justify-between mb-10">
                       <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-primary-500" />
                          <h3 className="text-xs font-black uppercase tracking-widest">Active Tunnel</h3>
                       </div>
                       <button onClick={() => setShowParticipants(false)} className="text-slate-500 hover:text-white">
                         <Shield className="w-4 h-4" />
                       </button>
                    </div>
                    <CallParticipantsList onClose={() => setShowParticipants(false)} />
                  </div>
                )}
              </main>
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-50">
          <div className="relative mb-8">
             <Loader2 className="w-24 h-24 text-primary-500 animate-spin" />
             <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white uppercase tracking-[0.4em] mb-3">Syncing Signal</p>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">End-to-end encrypted link active</p>
        </div>
      )}

      {/* Professional Metadata Footer */}
      <footer className="h-14 bg-slate-950/90 border-t border-white/5 flex items-center justify-between px-10 backdrop-blur-2xl text-slate-500">
        <div className="flex items-center gap-4">
          <Activity className="w-4 h-4 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">System Status: Nominal</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-20">
          <span>ProfessionalsBD Private Core v2.6</span>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <span>Bangladesh High-Trust Node</span>
        </div>
      </footer>
    </div>
  );
};

export default ConsultationRoom;
