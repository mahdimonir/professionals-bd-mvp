
export enum Role {
  USER = 'USER',
  PROFESSIONAL = 'PROFESSIONAL',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
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
  address?: string;
  memberSince?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: 'bKash' | 'SSLCommerz' | 'Card';
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
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
  userName: string;
  userAvatar?: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  // Updated category list to match all available industries in constants.tsx
  category: 'Legal' | 'Financial' | 'Medical' | 'Tech' | 'Architecture' | 'Education' | 'Marketing' | 'HR' | 'Real Estate' | 'Agriculture';
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
  education?: string;
  certifications?: string[];
  location?: string;
  reviews?: Review[];
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
  paymentId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Added AuthResponse to fix export error in authService.ts
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
