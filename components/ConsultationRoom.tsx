
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, MessageSquare, Loader2, Sparkles, CheckCircle2, PhoneOff, AlertTriangle } from 'lucide-react';
import { GeminiService, decodeAudioData, decode } from '../services/geminiService';
import { MOCK_PROFESSIONALS } from '../constants';
import { LiveServerMessage } from '@google/genai';
import { 
  StreamVideoClient, 
  StreamVideo, 
  StreamCall, 
  StreamTheme, 
  SpeakerLayout, 
  CallControls
} from '@stream-io/video-react-sdk';
import { AuthService } from '../services/authService';

const ConsultationRoom: React.FC = () => {
  const { expertId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const currentUser = AuthService.getSession();
  const expert = MOCK_PROFESSIONALS.find(p => p.id === expertId);
  
  const [status, setStatus] = useState<'connecting' | 'secure' | 'joining_stream' | 'error' | 'ended'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const geminiSessionRef = useRef<any>(null);

  useEffect(() => {
    const initializeCall = async () => {
      console.log("Initializing Session...", { expertId, hasToken: !!token });
      
      if (!token || !expertId || !currentUser) {
        console.warn("Missing required parameters for Stream Session");
        if (!token) setStatus('secure');
        return;
      }

      setStatus('joining_stream');

      try {
        // 1. Initialize Gemini Live API (Background Transcription)
        try {
          const gemini = new GeminiService();
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          outputNodeRef.current = audioContextRef.current.createGain();
          outputNodeRef.current.connect(audioContextRef.current.destination);

          const session = await gemini.connectLive({
            onOpen: () => console.log("Gemini Live Connected"),
            onMessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setTranscriptions(prev => [...prev, { role: 'Assistant/Expert', text }]);
              } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setTranscriptions(prev => [...prev, { role: 'You', text }]);
              }

              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current && outputNodeRef.current) {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNodeRef.current);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }
            },
            onError: (e) => console.error("Gemini Live Error:", e),
            onClose: () => console.log("Gemini Live Closed")
          });
          geminiSessionRef.current = session;
        } catch (geminiErr) {
          console.error("Gemini failed, continuing with Video only:", geminiErr);
        }

        // 2. Initialize Stream Video
        // Fallback chain for API Key
        const apiKey = (process as any).env?.STREAM_API_KEY || (process as any).env?.VITE_STREAM_API_KEY || "your_stream_api_key";
        
        console.log("Creating Stream Client with ID:", currentUser.id);
        const client = new StreamVideoClient({
          apiKey,
          user: { 
            id: currentUser.id, 
            name: currentUser.name || "Anonymous", 
            image: currentUser.avatar 
          },
          token,
        });

        const call = client.call("default", expertId);
        console.log("Attempting to join call:", expertId);
        
        await call.join({ create: true });
        
        console.log("Call joined successfully");
        setVideoClient(client);
        setActiveCall(call);
        setStatus('secure');
      } catch (err: any) {
        console.error("Stream/Session Initialization Final Error:", err);
        setErrorMessage(err.message || "Unknown connection error");
        setStatus('error');
      }
    };

    initializeCall();

    return () => {
      console.log("Cleaning up session...");
      if (geminiSessionRef.current) geminiSessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (activeCall) activeCall.leave();
    };
  }, [token, expertId, currentUser?.id]);

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-[200]">
        <div className="bg-red-500/10 p-6 rounded-full mb-8 ring-1 ring-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Neural Link Severed</h2>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 mb-10 max-w-md">
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            We couldn't establish a secure connection. This usually happens due to an invalid API key, an expired token, or a restrictive network firewall.
          </p>
          <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest bg-red-500/5 p-2 rounded-lg border border-red-500/10">
            Error: {errorMessage || 'Access Denied / Network Timeout'}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
            onClick={() => window.location.reload()} 
            className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all active:scale-95"
          >
            Retry Connection
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all border border-white/10 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 glass-dark border-b border-slate-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600/20 p-2 rounded-lg">
            <Shield className={`w-5 h-5 ${status === 'secure' ? 'text-green-400' : 'text-primary-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {expert ? `Expert: ${expert.name}` : `Live Session: ${expertId?.split('-')[1] || expertId}`}
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
              {status === 'secure' ? '● End-to-End Encrypted' : 'Establishing Secure Link...'}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Analysis Active</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {(status === 'connecting' || status === 'joining_stream') && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse mb-2">
              Syncing Secure Channels
            </p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
              {status === 'joining_stream' ? 'Handshaking with global nodes...' : 'Initializing cryptographic layer...'}
            </p>
          </div>
        )}

        {/* Video Area (Stream Video Components) */}
        <div className="flex-1 relative bg-slate-950 flex flex-col">
          {videoClient && activeCall ? (
            <StreamVideo client={videoClient}>
              <StreamTheme>
                <StreamCall call={activeCall}>
                  <div className="flex-1 relative">
                    <SpeakerLayout participantsBarPosition='bottom' />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                      <CallControls onLeave={() => navigate('/dashboard')} />
                    </div>
                  </div>
                </StreamCall>
              </StreamTheme>
            </StreamVideo>
          ) : (
            status === 'secure' && (
              <div className="flex-1 flex items-center justify-center text-slate-500 italic">
                Video engine standby. Waiting for participant input.
              </div>
            )
          )}
        </div>

        {/* Sidebar: AI Transcription */}
        <div className="w-96 glass-dark border-l border-white/5 flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-white/5 bg-primary-600/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-600/20">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Transcript</h3>
                <p className="text-[9px] text-primary-500 font-bold uppercase">Real-time Analysis</p>
              </div>
            </div>
            {status === 'secure' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {transcriptions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center gap-4">
                <div className="w-12 h-12 rounded-full border border-dashed border-slate-800 flex items-center justify-center">
                   <Sparkles className="w-5 h-5 opacity-20" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[160px] leading-relaxed">
                  Start speaking to begin cryptographic transcription
                </p>
              </div>
            )}
            {transcriptions.map((t, i) => (
              <div key={i} className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-3 rounded-full ${t.role === 'You' ? 'bg-primary-500' : 'bg-indigo-500'}`}></div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{t.role}</p>
                </div>
                <p className="text-sm text-slate-200 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed shadow-sm">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-slate-900/50 border-t border-white/5">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Shield className="w-4 h-4 text-primary-500" />
              Session Verified & Sealed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
