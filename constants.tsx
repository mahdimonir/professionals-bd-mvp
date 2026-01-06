
import { ProfessionalProfile, BookingStatus, Booking, User, Role } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Zayan Mallick', email: 'zayan@example.com', role: Role.USER, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Farhan Ahmed', email: 'farhan@pro.com', role: Role.PROFESSIONAL, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Tania Kabir', email: 'tania@pro.com', role: Role.PROFESSIONAL, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u100', name: 'Admin One', email: 'admin@probd.com', role: Role.ADMIN, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u100' },
  { id: 'u200', name: 'Mod Sarah', email: 'sarah@probd.com', role: Role.MODERATOR, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u200' },
];

export const MOCK_PROFESSIONALS: ProfessionalProfile[] = [
  {
    id: 'p1',
    userId: 'u2',
    name: 'Adv. Farhan Ahmed',
    avatar: 'https://picsum.photos/200/200?random=1',
    specialties: ['Corporate Law', 'IP Rights'],
    rates: 5000,
    experience: 12,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Senior consultant specializing in Bangladeshi corporate regulations.',
    rating: 4.9,
    status: 'Available Now'
  },
  {
    id: 'p2',
    userId: 'u3',
    name: 'Tania Kabir, FCA',
    avatar: 'https://picsum.photos/200/200?random=2',
    specialties: ['Tax Planning', 'Audit'],
    rates: 3500,
    experience: 8,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Expert chartered accountant for startups.',
    rating: 4.8,
    status: 'Busy'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    userId: 'u1',
    userName: 'Zayan Mallick',
    professionalId: 'p1',
    professionalName: 'Adv. Farhan Ahmed',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    status: BookingStatus.CONFIRMED,
    price: 5000
  },
  {
    id: 'b2',
    userId: 'u1',
    userName: 'Zayan Mallick',
    professionalId: 'p2',
    professionalName: 'Tania Kabir, FCA',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 82800000).toISOString(),
    status: BookingStatus.COMPLETED,
    price: 3500,
    notes: 'Discussed Q3 tax filing and VAT exemptions.'
  },
  {
    id: 'b3',
    userId: 'u5',
    userName: 'Unknown Client',
    professionalId: 'p1',
    professionalName: 'Adv. Farhan Ahmed',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 169200000).toISOString(),
    status: BookingStatus.CANCELLED,
    price: 5000
  }
];
