
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
export class GeminiService {
  // Concierge Chat (Gemini 3 Flash)
  async getConciergeResponse(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    // Always use the required initialization format: new GoogleGenAI({ apiKey: process.env.API_KEY })
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
    // Use .text property directly as it is a getter, not a function.
    return response.text;
  }

  // Live Consultation (Gemini 2.5 Flash Native Audio)
  async connectLive(callbacks: {
    onOpen: () => void,
    onMessage: (message: LiveServerMessage) => void,
    onError: (e: any) => void,
    onClose: () => void
  }) {
    // Create a new instance right before making an API call to ensure current credentials.
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
        // responseModalities must be an array with a single Modality.AUDIO element.
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

/**
 * Helper: Decode PCM Base64 to AudioBuffer
 * The audio bytes returned by the API is raw PCM data. 
 * It is not a standard file format like .wav or .mp3 and contains no header.
 */
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

// Helper: Base64 Decoding (Manually implemented as per guidelines)
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Base64 Encoding (Manually implemented as per guidelines)
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
