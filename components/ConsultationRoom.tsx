
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Loader2, PhoneOff, AlertTriangle, Fingerprint, 
  UserPlus, Check, Mic, MicOff, Video, VideoOff, 
  ArrowRight, Lock, Bot, Terminal, Activity
} from 'lucide-react';
import { GeminiService, decodeAudioData, decode, encode } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { 
  StreamVideoClient, 
  StreamVideo, 
  StreamCall, 
  StreamTheme, 
  SpeakerLayout, 
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { AuthService } from '../services/authService';
import { ApiService } from '../services/apiService';
import { jwtDecode } from 'jwt-decode';

const InviteButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  const handleInvite = () => {
    // For HashRouter, window.location.href is required to get the full link with # and params
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleInvite}
      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-600/20 active:scale-95 group"
    >
      {copied ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />}
      {copied ? 'Link Copied!' : 'Invite Participant'}
    </button>
  );
};

const CustomCallControls = ({ onLeave }: { onLeave: () => void }) => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, isMute: micMuted } = useMicrophoneState();
  const { camera, isMute: camMuted } = useCameraState();

  return (
    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl">
      <button 
        onClick={() => microphone.toggle()}
        className={`p-3 rounded-xl transition-all ${micMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}
      >
        {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
      <button 
        onClick={() => camera.toggle()}
        className={`p-3 rounded-xl transition-all ${camMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}
      >
        {camMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </button>
      <div className="w-px h-6 bg-white/10 mx-1"></div>
      <button 
        onClick={onLeave}
        className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
};

const ConsultationRoom: React.FC = () => {
  const { expertId } = useParams();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token');
  const callType = searchParams.get('type') || 'default';
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(AuthService.getSession());
  const [guestName, setGuestName] = useState('');
  const [status, setStatus] = useState<'idle' | 'joining_stream' | 'secure' | 'error'>('idle');
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const geminiSessionPromiseRef = useRef<Promise<any> | null>(null);

  const createAudioBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async (user = currentUser) => {
    if (!expertId) return;
    
    setStatus('joining_stream');
    setLoadingStep('Authorizing Identity...');
    
    try {
      // 1. Resolve Token
      let sessionToken = initialToken;
      if (!sessionToken && user) {
        const route = user.id.startsWith('guest_') 
          ? `/meetings/adhoc/${expertId}/guest-token` 
          : `/meetings/adhoc/${expertId}/token`;
        
        const res = user.id.startsWith('guest_') 
          ? await ApiService.post<any>(route, { userId: user.id }) 
          : await ApiService.get<any>(route);
        
        if (res.success) sessionToken = res.data.token;
      }

      if (!sessionToken) {
         if (!user) return; 
         throw new Error("Authorization token is missing. Please re-enter from dashboard.");
      }

      // --- CRITICAL IDENTITY SYNC ---
      // We MUST use the user_id that is actually signed inside the JWT
      let streamUserId = user?.id || 'anonymous';
      try {
        const decoded: any = jwtDecode(sessionToken);
        if (decoded.user_id) {
          streamUserId = decoded.user_id;
          console.debug("Stream User ID synced with JWT:", streamUserId);
        }
      } catch (e) {
        console.warn("Could not decode JWT. Handshake might fail.");
      }

      setLoadingStep('Connecting to Media Mesh...');

      // 2. Initialize Stream Client
      const client = new StreamVideoClient({
        apiKey: "h6m4288m7v92",
        user: { 
          id: streamUserId, 
          name: user?.name || 'Authorized Guest', 
          image: user?.avatar 
        },
        token: sessionToken,
      });

      // 3. Join the Call
      const call = client.call(callType, expertId);
      
      // Use a slightly longer timeout for international handshakes
      const joinTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Media Handshake Timed Out. Please check your network or try a different browser.")), 30000)
      );

      // We get or create to be safer
      await Promise.race([
        call.getOrCreate({ data: { members: [{ user_id: streamUserId }] } }).then(() => call.join()),
        joinTimeout
      ]);
      
      setVideoClient(client);
      setActiveCall(call);
      setStatus('secure');

      // 4. Initialize Gemini AI Node (Optional/Async)
      initGemini();

    } catch (err: any) {
      console.error("Session Establishment Failed:", err);
      setErrorMessage(err.message || "Failed to establish secure session.");
      setStatus('error');
    }
  };

  const initGemini = async () => {
    try {
      const gemini = new GeminiService();
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = gemini.connectLive({
        onOpen: () => {
          const source = inputAudioContext.createMediaStreamSource(stream);
          const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createAudioBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onMessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setTranscriptions(prev => [...prev.slice(-10), { role: 'Expert/AI', text: message.serverContent!.outputTranscription!.text }]);
          } else if (message.serverContent?.inputTranscription) {
            setTranscriptions(prev => [...prev.slice(-10), { role: 'You', text: message.serverContent!.inputTranscription!.text }]);
          }

          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          }
        },
        onError: (err) => console.error("Gemini Error:", err),
        onClose: () => console.log("Gemini Closed")
      });

      geminiSessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.warn("Gemini Node failed to start.", err);
    }
  };

  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    const guestUser = AuthService.setGuestSession(guestName);
    setCurrentUser(guestUser);
    startSession(guestUser);
  };

  useEffect(() => {
    if (initialToken || currentUser) startSession();
    return () => {
      if (videoClient) videoClient.disconnectUser();
      if (audioContextRef.current) audioContextRef.current.close();
      geminiSessionPromiseRef.current?.then(s => s.close());
    };
  }, [expertId]);

  if (!currentUser && !initialToken && status !== 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-[200]">
        <div className="max-w-md w-full glass-dark border border-white/5 p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
          <div className="bg-primary-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20">
             <Lock className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Private Session</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Secured via Trust-Lock™</p>
          <form onSubmit={handleGuestJoin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Your Display Name" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-500 transition-all placeholder:text-slate-600"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 flex items-center justify-center gap-2">
              Join Stream <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-[200]">
        <div className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20 mb-6">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4 uppercase">Identity Verification Failed</h2>
        <p className="text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">{errorMessage}</p>
        <button onClick={() => navigate('/dashboard')} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase text-xs transition-transform active:scale-95 shadow-2xl">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden text-slate-100 font-sans">
      <div className="h-20 glass-dark border-b border-white/5 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="bg-primary-600/20 p-2.5 rounded-xl border border-primary-500/20">
            <Shield className={`w-5 h-5 ${status === 'secure' ? 'text-green-400' : 'text-primary-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">{expertId?.toUpperCase()}</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{currentUser?.name || 'Authorized Guest'}</span>
            </div>
          </div>
        </div>
        <InviteButton />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {status === 'joining_stream' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
            <div className="relative mb-8">
               <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
               <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary-400 animate-pulse" />
            </div>
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-2">Syncing Trust Tokens...</p>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">{loadingStep}</p>
          </div>
        )}

        <div className="flex-1 relative bg-black/40 p-6 flex items-center justify-center">
          {videoClient && activeCall && (
            <StreamVideo client={videoClient}>
              <StreamTheme className="h-full w-full max-w-6xl">
                <StreamCall call={activeCall}>
                  <div className="h-full relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-900/40">
                    <SpeakerLayout participantsBarPosition='bottom' />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                      <CustomCallControls onLeave={() => navigate('/dashboard')} />
                    </div>
                  </div>
                </StreamCall>
              </StreamTheme>
            </StreamVideo>
          )}
        </div>

        <div className="w-96 glass-dark border-l border-white/5 flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary-600/5">
            <Bot className="w-5 h-5 text-primary-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Context Engine</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {transcriptions.map((t, i) => (
              <div key={i} className="animate-in slide-in-from-right-4">
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${t.role === 'You' ? 'text-primary-500' : 'text-indigo-400'}`}>{t.role}</p>
                <div className="text-[11px] text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                  {t.text}
                </div>
              </div>
            ))}
            {transcriptions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                <Terminal className="w-8 h-8" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-center">Standby for stream analysis...</p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-white/5 bg-slate-900/50">
            <div className="flex items-center gap-3">
               <Fingerprint className="w-4 h-4 text-slate-500" />
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Verified Cryptographic Link</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
