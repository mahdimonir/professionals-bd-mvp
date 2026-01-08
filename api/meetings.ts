
import { StreamClient } from '@stream-io/node-sdk';

// CRITICAL: Ensure these match your Stream Dashboard credentials
const STREAM_API_KEY = 'h6m4288m7v92';
const STREAM_SECRET = 'your_stream_secret_here'; // REPLACE THIS WITH YOUR ACTUAL SECRET

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

  // Handle Guest/Member Token Generation & Call Existence
  if (action === 'guest-token' || action === 'token') {
    try {
      const userId = action === 'guest-token' ? body.userId : (req.headers['x-user-id'] || 'anonymous_member');
      const targetCallId = callIdFromPath || `adhoc-${userId}-${Date.now()}`;
      
      if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

      // 1. Generate Token
      const token = client.generateUserToken({ 
        user_id: userId, 
        validity_in_seconds: 86400 
      });

      // 2. CREATE the call on the server so guests can join it
      const call = client.video.call('default', targetCallId);
      await call.getOrCreate({
        data: {
          created_by_id: userId,
          members: [{ user_id: userId, role: 'admin' }]
        }
      });

      return res.status(200).json({
        success: true,
        data: { 
          token, 
          callId: targetCallId, 
          callType: 'default',
          userId: userId
        }
      });
    } catch (error: any) {
      console.error('Stream Server Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Handle Initial Ad-hoc Creation (Host)
  if (method === 'POST' && adhocIndex !== -1 && !callIdFromPath) {
    try {
      const creatorId = req.headers['x-user-id'] || 'admin_creator';
      const newCallId = `adhoc-${creatorId}-${Date.now()}`;
      
      const token = client.generateUserToken({ user_id: creatorId });

      // Pre-create the call
      const call = client.video.call('default', newCallId);
      await call.getOrCreate({ data: { created_by_id: creatorId } });

      return res.status(201).json({
        success: true,
        data: { 
          id: newCallId,
          callId: newCallId,
          token: token,
          callType: 'default',
          userId: creatorId
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
