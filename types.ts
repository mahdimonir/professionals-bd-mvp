
export enum Role {
  USER = 'USER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export type AvailabilityStatus = 'Available Now' | 'Busy' | 'Offline';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isSuspended?: boolean;
  bio?: string;
  location?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  category: 'Legal' | 'Financial' | 'Medical' | 'Tech';
  specialties: string[];
  rates: number;
  experience: number;
  languages: string[];
  isVerified: boolean;
  isApproved?: boolean;
  bio: string;
  rating: number;
  reviewCount: number;
  status?: AvailabilityStatus;
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  professionalId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  price: number;
  professionalName: string;
  notes?: string;
  review?: Review;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
