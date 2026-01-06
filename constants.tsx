
import React from 'react';
import { ProfessionalProfile, Role, BookingStatus, Booking } from './types';

export const MOCK_PROFESSIONALS: ProfessionalProfile[] = [
  {
    id: 'p1',
    userId: 'u2',
    name: 'Adv. Farhan Ahmed',
    avatar: 'https://picsum.photos/200/200?random=1',
    specialties: ['Corporate Law', 'IP Rights', 'Dispute Resolution'],
    rates: 5000,
    experience: 12,
    languages: ['Bengali', 'English'],
    isVerified: true,
    bio: 'Senior consultant specializing in Bangladeshi corporate regulations and international trade laws.',
    rating: 4.9
  },
  {
    id: 'p2',
    userId: 'u3',
    name: 'Tania Kabir, FCA',
    avatar: 'https://picsum.photos/200/200?random=2',
    specialties: ['Strategic Tax Planning', 'Audit', 'Financial Advisory'],
    rates: 3500,
    experience: 8,
    languages: ['Bengali', 'English'],
    isVerified: true,
    bio: 'Expert chartered accountant with a focus on startup taxation and financial compliance.',
    rating: 4.8
  },
  {
    id: 'p3',
    userId: 'u4',
    name: 'Dr. Sameer Rahman',
    avatar: 'https://picsum.photos/200/200?random=3',
    specialties: ['Mental Health', 'Clinical Psychology', 'Family Therapy'],
    rates: 2500,
    experience: 15,
    languages: ['Bengali', 'English', 'Hindi'],
    isVerified: true,
    bio: 'Compassionate psychologist dedicated to mental well-being and family counseling.',
    rating: 5.0
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    userId: 'u1',
    professionalId: 'p1',
    professionalName: 'Adv. Farhan Ahmed',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 7200000).toISOString(),
    status: BookingStatus.CONFIRMED,
    price: 5000
  },
  {
    id: 'b2',
    userId: 'u1',
    professionalId: 'p2',
    professionalName: 'Tania Kabir, FCA',
    startTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    endTime: new Date(Date.now() + 90000000).toISOString(),
    status: BookingStatus.PENDING,
    price: 3500
  }
];
