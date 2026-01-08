
import { StreamClient } from '@stream-io/node-sdk';

// These should be set in your Vercel Environment Variables
const STREAM_API_KEY = process.env.STREAM_API_KEY || 'h6m4288m7v92';
const STREAM_SECRET = process.env.STREAM_SECRET; 

if (!STREAM_SECRET) {
  console.warn("STREAM_SECRET is not defined. Token generation will fail.");
}

const client = new StreamClient(STREAM_API_KEY, STREAM_SECRET || '');

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

  // Handle Token Generation
  if (action === 'guest-token' || action === 'token') {
    try {
      const userId = action === 'guest-token' ? body.userId : (req.headers['x-user-id'] || 'anonymous_member');
      const targetCallId = callIdFromPath;
      
      if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
      if (!STREAM_SECRET) return res.status(500).json({ success: false, message: 'Server configuration error' });

      const token = client.generateUserToken({ 
        user_id: userId, 
        validity_in_seconds: 86400 
      });

      // Ensure call exists before guest joins
      const call = client.video.call('default', targetCallId || '');
      await call.getOrCreate({
        data: {
          created_by_id: userId,
          members: [{ user_id: userId, role: 'admin' }]
        }
      });

      return res.status(200).json({
        success: true,
        data: { token, callId: targetCallId, userId }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handle Initial Creation
  if (method === 'POST' && adhocIndex !== -1 && !callIdFromPath) {
    try {
      const creatorId = req.headers['x-user-id'] || 'admin_creator';
      const newCallId = `adhoc-${creatorId}-${Date.now()}`;
      const token = client.generateUserToken({ user_id: creatorId });
      const call = client.video.call('default', newCallId);
      await call.getOrCreate({ data: { created_by_id: creatorId } });

      return res.status(201).json({
        success: true,
        data: { id: newCallId, callId: newCallId, token, userId: creatorId }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
