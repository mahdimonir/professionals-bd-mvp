
import { prisma } from '../lib/prisma';
import { BookingStatus } from '../types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userId, professionalId, startTime, endTime, price } = req.body;

    if (!userId || !professionalId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    // Create the booking in the database
    const booking = await prisma.booking.create({
      data: {
        userId,
        professionalId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price: price,
        status: BookingStatus.CONFIRMED, // Auto-confirming for MVP flow
      },
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    console.error('Booking Error:', error);
    return res.status(500).json({ 
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
}
