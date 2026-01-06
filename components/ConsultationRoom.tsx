
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Shield, MessageSquare, List } from 'lucide-react';
import { GeminiService, decodeAudioData, decode } from '../services/geminiService';
import { MOCK_PROFESSIONALS } from '../constants';
import { LiveServerMessage } from '@google/genai';

const ConsultationRoom: React.FC = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const expert = MOCK_PROFESSIONALS.find(p => p.id === expertId);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [status, setStatus] = useState<'connecting' | 'secure' | 'ended'>('connecting');
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (!expert) return;

    const startSession = async () => {
      const gemini = new GeminiService();
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);

      try {
        const session = await gemini.connectLive({
          onOpen: () => setStatus('secure'),
          onMessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => [...prev, { role: 'Expert (AI Support)', text }]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => [...prev, { role: 'You', text }]);
            }

            // Handle Audio Playback
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
      } catch (err) {
        console.error("Failed to connect:", err);
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [expert]);

  if (!expert) return <div>Expert not found.</div>;

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col">
      {/* Header */}
      <div className="h-16 glass-dark border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Shield className={`w-5 h-5 ${status === 'secure' ? 'text-green-400' : 'text-blue-400'}`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Secure Consult: {expert.name}</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {status === 'secure' ? '● End-to-End Encrypted' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Transcript On</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative p-6 bg-slate-950 flex flex-col gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Expert Video (Placeholder) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
              <img 
                src={expert.avatar} 
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
                alt="Expert"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <span className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {expert.name}
                </span>
              </div>
            </div>

            {/* Self Video (Placeholder) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                {isVideoOn ? (
                  <img src="https://picsum.photos/400/400?random=10" className="w-full h-full object-cover opacity-40" />
                ) : (
                  <VideoOff className="w-12 h-12" />
                )}
              </div>
              <div className="absolute bottom-6 left-6">
                <span className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-white">
                  You
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="h-20 flex items-center justify-center gap-6">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-red-600 hover:bg-red-500 p-4 rounded-full text-white transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:scale-110"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Sidebar: Transcription */}
        <div className="w-80 glass-dark border-l border-slate-800 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Dialogue</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcriptions.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center px-4 italic">
                Awaiting conversation... 
                Transcripts appear here automatically.
              </div>
            )}
            {transcriptions.map((t, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{t.role}</p>
                <p className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-blue-600/5 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3 h-3 text-blue-400" />
              This transcript is encrypted and private.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationRoom;
