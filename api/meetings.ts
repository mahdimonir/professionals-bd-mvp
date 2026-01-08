
import { StreamClient } from '@stream-io/node-sdk';

// These would ideally be in your .env file
const STREAM_API_KEY = 'h6m4288m7v92';
const STREAM_SECRET = 'your_stream_secret_here'; // Replace with your actual secret from Stream Dashboard

const client = new StreamClient(STREAM_API_KEY, STREAM_SECRET);

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;
  const callId = query.id;

  // Handle Token Generation (Registered Users): GET /api/meetings/adhoc/[id]/token
  if (method === 'GET' && query.action === 'token') {
    try {
      const userId = req.headers['x-user-id'] || query.userId || 'anonymous_guest';
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

  // Handle Guest Token Generation: POST /api/meetings/adhoc/[id]/guest-token
  // This matches the user's specific request for the guest-token route
  if (method === 'POST' && query.action === 'guest-token') {
    try {
      const { userId } = body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId for guest token' });
      }
      
      const validity = 60 * 60 * 2; // Guest tokens shorter duration (2h)
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
  if (method === 'POST' && !query.action) {
    try {
      const newCallId = `adhoc_${Math.random().toString(36).substr(2, 9)}`;
      const { title } = body;

      return res.status(201).json({
        success: true,
        data: { 
          id: newCallId,
          callId: newCallId,
          title: title || 'Quick Consultation'
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
