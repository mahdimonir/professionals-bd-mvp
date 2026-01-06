import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type } from '@google/genai';

export class GeminiService {
  // Concierge Chat (Gemini 3 Flash)
  async getConciergeResponse(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are ProBD Concierge, a helpful assistant for ProfessionalsBD, an expert network in Bangladesh. Help users find Legal, Financial, or Medical experts. Use a professional and friendly tone. Mention BDT (৳) when discussing rates.",
      }
    });
    return response.text;
  }

  // AI Expert Recommendations
  async getExpertRecommendations(userHistory: any[], allExperts: any[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      User Booking History: ${JSON.stringify(userHistory)}
      Available Experts: ${JSON.stringify(allExperts.map(e => ({ id: e.id, name: e.name, specialties: e.specialties, bio: e.bio })))}
      
      Analyze the user's booking history and recommend the top 3 most relevant experts from the available list. 
      For each recommendation, provide a brief 'reason' why they are a good match (e.g., "Since you recently consulted a lawyer, you might need a tax expert for compliance").
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: "You are a professional matching engine. Analyze user needs and suggest experts. Return only JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    expertId: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['expertId', 'reason']
                }
              }
            },
            required: ['recommendations']
          }
        }
      });

      return JSON.parse(response.text || '{"recommendations": []}');
    } catch (err) {
      console.error("AI Recommendation Error:", err);
      return { recommendations: [] };
    }
  }

  // Live Consultation (Gemini 2.5 Flash Native Audio)
  async connectLive(callbacks: {
    onOpen: () => void,
    onMessage: (message: LiveServerMessage) => void,
    onError: (e: any) => void,
    onClose: () => void
  }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: callbacks.onOpen,
        onmessage: callbacks.onMessage,
        onerror: callbacks.onError,
        onclose: callbacks.onClose,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });
  }
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}