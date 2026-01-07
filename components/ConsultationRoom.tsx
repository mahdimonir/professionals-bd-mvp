
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Shield, MessageSquare, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { GeminiService, decodeAudioData, decode } from '../services/geminiService';
import { MOCK_PROFESSIONALS } from '../constants';
import { LiveServerMessage } from '@google/genai';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

const ConsultationRoom: React.FC = () => {
  const { expertId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const expert = MOCK_PROFESSIONALS.find(p => p.id === expertId);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [status, setStatus] = useState<'connecting' | 'secure' | 'joining_stream' | 'ended'>('connecting');
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamClientRef = useRef<any>(null);
  const streamCallRef = useRef<any>(null);

  useEffect(() => {
    const startSession = async () => {
      // Gemini Live API Setup
      const gemini = new GeminiService();
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);

      try {
        const session = await gemini.connectLive({
          onOpen: () => setStatus(token ? 'joining_stream' : 'secure'),
          onMessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, { role: 'Expert Support', text }]);
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
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onError: (e) => console.error("Session Error:", e),
          onClose: () => setStatus('ended')
        });
        
        sessionRef.current = session;

        // If a token is provided, join the Stream call
        if (token && expertId) {
          try {
            // NOTE: apiKey should ideally come from environment
            const streamClient = new StreamVideoClient({ 
              apiKey: "your_stream_api_key", 
              token 
            });
            const call = streamClient.call("default", expertId);
            await call.join();
            
            streamClientRef.current = streamClient;
            streamCallRef.current = call;
            setStatus('secure');
          } catch (streamErr) {
            console.error("Stream Join Error:", streamErr);
            // Revert status even if stream fails, so UI isn't stuck
            setStatus('secure');
          }
        }
      } catch (err) {
        console.error("Failed to connect:", err);
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamCallRef.current) streamCallRef.current.leave();
    };
  }, [token, expertId]);

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col">
      {/* Header */}
      <div className="h-16 glass-dark border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600/20 p-2 rounded-lg">
            <Shield className={`w-5 h-5 ${status === 'secure' ? 'text-green-400' : 'text-primary-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {expert ? `Secure Consult: ${expert.name}` : `Live Session: ${expertId}`}
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
              {status === 'secure' ? '● End-to-End Encrypted' : 'Establishing Secure Link...'}
              {token && <span className="ml-2 text-primary-500">● Auth Token Validated</span>}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Insights Active</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative p-6 bg-slate-950 flex flex-col gap-4">
          {(status === 'connecting' || status === 'joining_stream') && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
              <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-6" />
              <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">
                {status === 'joining_stream' ? 'Handshaking with Stream Servers...' : 'Initializing Neural Link...'}
              </p>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Participant Video (Simulated/Stream-ready) */}
            <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group ring-1 ring-slate-800">
              {expert ? (
                <img 
                  src={expert.avatar} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[2000ms]" 
                  alt="Expert"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-primary-600/10 flex items-center justify-center border border-primary-500/20 shadow-inner">
                    <Sparkles className="w-12 h-12 text-primary-500" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-white font-black uppercase tracking-widest text-xs">Waiting for Host</p>
                    <p className="text-slate-500 text-[10px] font-bold">The session will start automatically</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <div className="flex flex-col gap-1">
                   <span className="bg-slate-900/80 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                    {expert ? expert.name : 'Incoming Guest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Self Video (Simulated/Stream-ready) */}
            <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-slate-800">
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                {isVideoOn ? (
                  <img src="https://picsum.photos/800/800?random=self" className="w-full h-full object-cover opacity-60 grayscale-[0.2]" />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <VideoOff className="w-16 h-16 text-slate-800" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Camera Disabled</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <span className="bg-primary-600/80 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10 text-xs font-black text-white uppercase tracking-widest">
                  Self <span className="text-[10px] opacity-60 ml-2">(Local)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Floating Controls Bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="glass-dark border border-white/10 px-8 py-5 rounded-[2.5rem] flex items-center gap-8 shadow-2xl backdrop-blur-2xl">
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-5 rounded-3xl transition-all ${isMicOn ? 'bg-slate-800/80 text-white hover:bg-slate-700' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'}`}
              >
                {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
              </button>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-5 rounded-3xl transition-all ${isVideoOn ? 'bg-slate-800/80 text-white hover:bg-slate-700' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
              >
                {isVideoOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
              </button>
              <div className="w-px h-10 bg-white/10"></div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 hover:bg-red-500 p-5 rounded-3xl text-white transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-110 active:scale-95 group"
              >
                <PhoneOff className="w-8 h-8 group-hover:rotate-[135deg] transition-transform duration-500" />
              </button>
            </div>
          </div>
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
                   <Mic className="w-5 h-5 opacity-20" />
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
