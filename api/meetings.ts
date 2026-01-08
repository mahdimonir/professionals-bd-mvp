
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = 'h6m4288m7v92';
const STREAM_SECRET = 'your_stream_secret_here';

const client = new StreamClient(STREAM_API_KEY, STREAM_SECRET);

export default async function handler(req: any, res: any) {
  // Standard CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { method, body } = req;
  
  // Robust Path Parsing
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParts = url.pathname.split('/').filter(Boolean); 
  
  // Find "adhoc" and determine context from there
  const adhocIndex = pathParts.indexOf('adhoc');
  const callId = adhocIndex !== -1 ? pathParts[adhocIndex + 1] : null;
  const action = adhocIndex !== -1 ? pathParts[adhocIndex + 2] : null;

  // Handle Guest Token Generation: POST /api/meetings/adhoc/[id]/guest-token
  if (method === 'POST' && action === 'guest-token') {
    try {
      const { userId } = body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId for guest token' });
      }
      
      const validity = 60 * 60 * 2; // 2 hours
      const token = client.generateUserToken({ 
        user_id: userId, 
        validity_in_seconds: validity 
      });

      return res.status(200).json({
        success: true,
        data: { token }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handle Member Token Generation: GET /api/meetings/adhoc/[id]/token
  if (method === 'GET' && action === 'token') {
    try {
      const userId = req.headers['x-user-id'] || 'anonymous_guest';
      const validity = 60 * 60 * 24;
      const token = client.generateUserToken({ 
        user_id: userId, 
        validity_in_seconds: validity 
      });

      return res.status(200).json({
        success: true,
        data: { token }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handle Meeting Creation: POST /api/meetings/adhoc
  // Triggered by Admin/Moderator dashboard
  if (method === 'POST' && adhocIndex !== -1 && !callId) {
    try {
      const newCallId = `adhoc_${Math.random().toString(36).substr(2, 9)}`;
      return res.status(201).json({
        success: true,
        data: { 
          id: newCallId,
          callId: newCallId,
          title: body.title || 'Quick Consultation'
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
