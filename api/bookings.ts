
import { prisma } from '../lib/prisma';
import { BookingStatus } from '../types';

export default async function handler(req: any, res: any) {
  // Standard CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId, professionalId, startTime, endTime, price } = req.body;

    if (!userId || !professionalId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        professionalId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price: price || 0,
        status: BookingStatus.CONFIRMED,
      },
    });

    return res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error: any) {
    console.error('Booking Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
}
