
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, MessageSquare, Loader2, Sparkles, CheckCircle2, PhoneOff, AlertTriangle, Terminal } from 'lucide-react';
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
  const [activeKeyMasked, setActiveKeyMasked] = useState<string>('');
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const geminiSessionRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeCall = async () => {
      if (!token || !expertId || !currentUser) {
        if (isMounted) {
          setErrorMessage("Missing session token or expert ID. Please join from the dashboard.");
          setStatus('error');
        }
        return;
      }

      if (isMounted) setStatus('joining_stream');

      try {
        // DETECT API KEY - Support multiple env patterns
        const apiKey = 
          (import.meta as any).env?.VITE_STREAM_API_KEY || 
          (process.env as any).STREAM_API_KEY || 
          (process.env as any).VITE_STREAM_API_KEY ||
          "h6m4288m7v92"; // Fallback to demo only if others fail

        // For diagnostics
        setActiveKeyMasked(apiKey.length > 4 ? `${apiKey.substring(0, 4)}****` : 'Invalid Key');

        const client = new StreamVideoClient({
          apiKey,
          user: { 
            id: currentUser.id, 
            name: currentUser.name || "User", 
            image: currentUser.avatar 
          },
          token,
        });

        const call = client.call("default", expertId);
        
        // Timeout logic
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Handshake timeout (12s). The Stream network didn't respond. This usually means the API Key (${apiKey.substring(0,3)}...) or Token are mismatched.`)), 12000)
        );

        console.log(`🛰️ Attempting Stream Handshake with Key: ${apiKey.substring(0, 4)}...`);
        await Promise.race([call.join({ create: true }), timeout]);
        
        if (isMounted) {
          setVideoClient(client);
          setActiveCall(call);
          setStatus('secure');
        }

        // Initialize Gemini in background
        const gemini = new GeminiService();
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        outputNodeRef.current = audioContextRef.current.createGain();
        outputNodeRef.current.connect(audioContextRef.current.destination);

        gemini.connectLive({
          onOpen: () => console.log("✅ AI Analysis Active"),
          onMessage: async (message: LiveServerMessage) => {
            if (!isMounted) return;
            if (message.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev.slice(-10), { role: 'Expert/AI', text: message.serverContent!.outputTranscription!.text }]);
            } else if (message.serverContent?.inputTranscription) {
              setTranscriptions(prev => [...prev.slice(-10), { role: 'You', text: message.serverContent!.inputTranscription!.text }]);
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current && outputNodeRef.current) {
              const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current);
              source.start();
            }
          },
          onError: (e) => console.error("AI Link Error:", e),
          onClose: () => console.log("AI Link Closed")
        }).then(session => {
          geminiSessionRef.current = session;
        }).catch(err => console.warn("AI Assistant background failed", err));

      } catch (err: any) {
        console.error("🚨 Handshake Failure:", err);
        if (isMounted) {
          setErrorMessage(err.message || "A network error occurred during encryption setup.");
          setStatus('error');
        }
      }
    };

    initializeCall();

    return () => {
      isMounted = false;
      if (geminiSessionRef.current) geminiSessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (activeCall) activeCall.leave().catch(() => {});
    };
  }, [token, expertId, currentUser?.id]);

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-[200]">
        <div className="bg-red-500/10 p-6 rounded-full mb-8 ring-1 ring-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Handshake Failed</h2>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 mb-10 max-w-xl text-left">
          <div className="flex items-center gap-2 mb-4 text-primary-500">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Output</span>
          </div>
          <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Active Stream Key</p>
              <code className="text-[10px] text-primary-400 bg-primary-400/5 px-2 py-1 rounded">{activeKeyMasked}</code>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Expert ID</p>
              <code className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded">{expertId}</code>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
           <button onClick={() => window.location.reload()} className="bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-white/10">Retry Connection</button>
           <button onClick={() => navigate('/dashboard')} className="bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-slate-700 transition-all active:scale-95">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden">
      <div className="h-16 glass-dark border-b border-slate-800 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600/20 p-2 rounded-lg">
            <Shield className={`w-5 h-5 ${status === 'secure' ? 'text-green-400' : 'text-primary-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">
              {status === 'secure' ? 'Secure Channel: Operational' : 'Syncing Global Nodes...'}
            </h2>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Verified Stream: {activeKeyMasked}</p>
          </div>
        </div>
        {status === 'secure' && (
          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Encrypted Stream</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {(status === 'connecting' || status === 'joining_stream') && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
            <div className="relative mb-6">
               <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
               <Sparkles className="w-6 h-6 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">Establishing Secure Node Link</p>
            <p className="text-slate-600 text-[10px] font-bold uppercase mt-2">Key Verification: {activeKeyMasked}</p>
          </div>
        )}

        <div className="flex-1 relative bg-slate-950">
          {videoClient && activeCall ? (
            <StreamVideo client={videoClient}>
              <StreamTheme>
                <StreamCall call={activeCall}>
                  <div className="h-full relative">
                    <SpeakerLayout participantsBarPosition='bottom' />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                      <CallControls onLeave={() => navigate('/dashboard')} />
                    </div>
                  </div>
                </StreamCall>
              </StreamTheme>
            </StreamVideo>
          ) : status === 'secure' && (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 italic gap-4">
              <Shield className="w-12 h-12 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest">Waiting for remote connection...</p>
            </div>
          )}
        </div>

        <div className="w-80 glass-dark border-l border-white/5 flex flex-col hidden lg:flex">
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary-600/5">
            <MessageSquare className="w-4 h-4 text-primary-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Log</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {transcriptions.map((t, i) => (
              <div key={i} className="animate-in slide-in-from-right-2 duration-300">
                <p className={`text-[9px] font-black uppercase mb-1 ${t.role === 'You' ? 'text-primary-500' : 'text-indigo-400'}`}>{t.role}</p>
                <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">{t.text}</p>
              </div>
            ))}
            {transcriptions.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-20 italic text-[10px] text-white uppercase text-center px-10">
                Awaiting biometric audio for analysis...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
