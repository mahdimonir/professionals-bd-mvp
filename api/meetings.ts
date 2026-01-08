
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = 'h6m4288m7v92';
const STREAM_SECRET = 'your_stream_secret_here';

const client = new StreamClient(STREAM_API_KEY, STREAM_SECRET);

export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PATCH,DELETE,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { method, body } = req;
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParts = url.pathname.split('/').filter(Boolean); 
  
  const adhocIndex = pathParts.indexOf('adhoc');
  const callIdFromPath = adhocIndex !== -1 ? pathParts[adhocIndex + 1] : null;
  const action = adhocIndex !== -1 ? pathParts[adhocIndex + 2] : null;

  // Handle Guest Token Generation
  if (method === 'POST' && action === 'guest-token') {
    try {
      const { userId } = body;
      if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
      
      const token = client.generateUserToken({ 
        user_id: userId, 
        validity_in_seconds: 7200 
      });

      return res.status(200).json({
        success: true,
        data: { token, callId: callIdFromPath, callType: 'default' }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handle Member Token Generation
  if (method === 'GET' && action === 'token') {
    try {
      const userId = req.headers['x-user-id'] || 'anonymous_guest';
      const token = client.generateUserToken({ 
        user_id: userId, 
        validity_in_seconds: 86400 
      });

      return res.status(200).json({
        success: true,
        data: { token, callId: callIdFromPath, callType: 'default' }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handle Ad-hoc Creation
  if (method === 'POST' && adhocIndex !== -1 && !callIdFromPath) {
    try {
      const newCallId = `adhoc_${Math.random().toString(36).substr(2, 9)}`;
      const creatorId = req.headers['x-user-id'] || 'admin';
      
      const token = client.generateUserToken({ user_id: creatorId });

      return res.status(201).json({
        success: true,
        data: { 
          id: newCallId,
          callId: newCallId,
          token: token,
          callType: 'default'
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
