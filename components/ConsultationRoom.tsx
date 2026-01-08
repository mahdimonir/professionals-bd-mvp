import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, Loader2, PhoneOff, AlertTriangle, Fingerprint, 
  UserPlus, Check, Mic, MicOff, Video, VideoOff, 
  ArrowRight, Lock, Bot, Terminal, Activity, Users
} from 'lucide-react';
import { GeminiService, decodeAudioData, decode, encode } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
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

// Accessing environment variables via process.env for compatibility
const STREAM_API_KEY = process.env.VITE_STREAM_API_KEY || 'h6m4288m7v92';

if (!STREAM_API_KEY) {
  console.error("STREAM_API_KEY is missing in environment variables");
}

// Invite Button
const InviteButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
    >
      {copied ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Invite Others'}
    </button>
  );
};

// Call Controls
const CustomCallControls = ({ onLeave }: { onLeave: () => void }) => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, isMute: micMuted } = useMicrophoneState();
  const { camera, isMute: camMuted } = useCameraState();

  return (
    <div className="flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
      <button 
        onClick={() => microphone.toggle()}
        className={`p-4 rounded-2xl transition-all ${micMuted ? 'bg-red-600/80 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
      <button 
        onClick={() => camera.toggle()}
        className={`p-4 rounded-2xl transition-all ${camMuted ? 'bg-red-600/80 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        {camMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
      </button>
      <div className="w-px h-10 bg-white/10"></div>
      <button 
        onClick={onLeave}
        className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl transition-all shadow-lg active:scale-95"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
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
  const [transcriptions, setTranscriptions] = useState<{ role: string; text: string }[]>([]);

  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const geminiSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

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

        if (!res.success) throw new Error(res.message || "Failed to get token");

        token = res.data.token;
        if (res.data.callId) callId = res.data.callId;
      }

      if (!token) throw new Error("No access token available");

      const decoded: any = jwtDecode(token);
      const streamUserId = decoded.user_id || currentUser?.id || 'unknown';

      const client = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: {
          id: streamUserId,
          name: currentUser?.name || "Guest",
        },
        token: token,
        options: {
          logLevel: "debug",
        },
      });

      const call = client.call(callType, callId);
      await call.join({ create: true });

      setVideoClient(client);
      setActiveCall(call);
      setStatus('connected');

      initGemini();

    } catch (err: any) {
      console.error("Failed to join call:", err);
      setErrorMessage(err.message || "Connection failed. Check your configuration.");
      setStatus('error');
    }
  };

  const initGemini = async () => {
    try {
      const gemini = new GeminiService();
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = gemini.connectLive({
        onOpen: () => {
          const source = inputCtx.createMediaStreamSource(micStream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const blob = createAudioBlob(input);
            sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onMessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.inputTranscription?.text) {
            setTranscriptions(prev => [...prev.slice(-10), { role: 'You', text: msg.serverContent!.inputTranscription!.text }]);
          }
          if (msg.serverContent?.outputTranscription?.text) {
            setTranscriptions(prev => [...prev.slice(-10), { role: 'AI Expert', text: msg.serverContent!.outputTranscription!.text }]);
          }

          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && audioContextRef.current) {
            nextStartTimeRef.current = Math.max(
              nextStartTimeRef.current,
              audioContextRef.current.currentTime,
            );
            
            const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
            const src = audioContextRef.current.createBufferSource();
            src.buffer = buffer;
            src.connect(audioContextRef.current.destination);
            src.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          }

          if (msg.serverContent?.interrupted) {
            nextStartTimeRef.current = 0;
          }
        },
        onError: (err) => console.error("Gemini AI Error:", err),
        onClose: () => console.log("Gemini AI Node Offline")
      });

      geminiSessionRef.current = sessionPromise;
    } catch (err) {
      console.warn("Gemini AI disabled:", err);
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
      audioContextRef.current?.close();
      geminiSessionRef.current?.then((s: any) => s.close());
    };
  }, [currentUser, initialToken, expertId]);

  if (!currentUser && !initialToken) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-12">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-primary-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/30">
              <Lock className="w-12 h-12 text-primary-500" />
            </div>
            <h1 className="text-3xl font-black text-white mb-3">Secure Consultation</h1>
            <p className="text-slate-400 text-sm">Enter your name to join the private session</p>
          </div>
          <form onSubmit={handleGuestJoin} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-medium placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-all"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-black rounded-2xl text-lg uppercase tracking-wider transition-all shadow-xl active:scale-95"
            >
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Connection Failed</h2>
          <p className="text-slate-400 mb-8">{errorMessage || "Unable to establish secure connection"}</p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-wide"
            >
              Retry Connection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden">
      <div className="h-20 border-b border-white/10 px-8 flex items-center justify-between backdrop-blur-xl bg-slate-950/80">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
            <Shield className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider">
              Session: {expertId?.split('-')[0]?.toUpperCase() || 'PRIVATE'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {currentUser?.name || 'Guest'}
            </div>
          </div>
        </div>
        <InviteButton />
      </div>

      <div className="flex h-full">
        <div className="flex-1 relative flex items-center justify-center p-8">
          {status === 'joining' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10">
              <Loader2 className="w-20 h-20 text-primary-500 animate-spin mb-8" />
              <p className="text-2xl font-black text-white mb-2">Connecting...</p>
              <p className="text-slate-400">Establishing encrypted media channel</p>
            </div>
          )}

          {videoClient && activeCall && (
            <StreamVideo client={videoClient}>
              <StreamTheme>
                <StreamCall call={activeCall}>
                  <div className="w-full h-full max-w-7xl mx-auto">
                    <SpeakerLayout participantsBarPosition="bottom" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
                      <CustomCallControls onLeave={() => navigate('/dashboard')} />
                    </div>
                  </div>
                </StreamCall>
              </StreamTheme>
            </StreamVideo>
          )}
        </div>

        <div className="w-96 border-l border-white/10 bg-slate-900/50 hidden xl:block">
          <div className="h-20 border-b border-white/10 px-6 flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary-500" />
            <h3 className="font-black text-sm uppercase tracking-wider">Live AI Assistant</h3>
          </div>
          <div className="h-[calc(100vh-160px)] overflow-y-auto p-6 space-y-4">
            {transcriptions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center opacity-40">
                <div>
                  <Terminal className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase">Waiting for conversation...</p>
                </div>
              </div>
            ) : (
              transcriptions.map((t, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${t.role === 'You' ? 'bg-primary-600/10 border-primary-500/30' : 'bg-slate-800/50 border-white/10'}`}>
                  <p className="text-xs font-black uppercase mb-1 opacity-70">{t.role}</p>
                  <p className="text-sm leading-relaxed">{t.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;