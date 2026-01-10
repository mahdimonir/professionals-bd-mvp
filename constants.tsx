
import { ProfessionalProfile, Role, User } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Zayan Mallick', email: 'zayan@example.com', role: Role.USER, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u1', memberSince: '2024-01-15' },
  { id: 'u2', name: 'Farhan Ahmed', email: 'farhan@pro.com', role: Role.PROFESSIONAL, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u100', name: 'Admin One', email: 'admin@probd.com', role: Role.ADMIN, isVerified: true, avatar: 'https://i.pravatar.cc/150?u=u100' },
];

export const MOCK_PROFESSIONALS: ProfessionalProfile[] = [
  {
    id: 'p1',
    userId: 'u2',
    name: 'Adv. Farhan Ahmed',
    avatar: 'https://picsum.photos/400/400?random=11',
    category: 'Legal',
    specialties: ['Corporate Law', 'IP Rights', 'Dispute Resolution'],
    rates: 5000,
    experience: 12,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Senior consultant specializing in Bangladeshi corporate regulations and international trade laws. Dedicated to providing robust legal frameworks for startups and established enterprises.',
    rating: 4.9,
    reviewCount: 128,
    status: 'Available Now',
    education: 'LLM, University of Dhaka',
    certifications: ['High Court Bar Membership', 'IP Rights Council'],
    location: 'Gulshan, Dhaka',
    reviews: [{ id: 'r1', rating: 5, comment: 'Incredible legal insights.', createdAt: '2024-02-10', userName: 'Asif Khan' }]
  },
  {
    id: 'p2',
    userId: 'u3',
    name: 'Tania Kabir, FCA',
    avatar: 'https://picsum.photos/400/400?random=22',
    category: 'Financial',
    specialties: ['Strategic Tax Planning', 'Audit', 'Financial Advisory'],
    rates: 3500,
    experience: 8,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Expert chartered accountant with a focus on startup taxation and financial compliance. Helping SMEs navigate the complex tax landscape of Bangladesh.',
    rating: 4.8,
    reviewCount: 94,
    status: 'Busy',
    education: 'FCA, ICAB',
    certifications: ['Chartered Accountant (ICAB)'],
    location: 'Banani, Dhaka'
  },
  {
    id: 'p3',
    userId: 'u4',
    name: 'Dr. Sameer Rahman',
    avatar: 'https://picsum.photos/400/400?random=33',
    category: 'Medical',
    specialties: ['Mental Health', 'Clinical Psychology'],
    rates: 2500,
    experience: 15,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Compassionate psychologist dedicated to mental well-being and family counseling. Specializes in stress management and adolescent behavior.',
    rating: 5.0,
    reviewCount: 215,
    status: 'Offline',
    education: 'PhD, BSMMU',
    location: 'Dhanmondi, Dhaka'
  },
  {
    id: 'p4',
    userId: 'u5',
    name: 'Ar. Rafiq Azam',
    avatar: 'https://picsum.photos/400/400?random=44',
    category: 'Architecture',
    specialties: ['Sustainable Design', 'Urban Planning'],
    rates: 6000,
    experience: 20,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Award-winning architect focusing on green building and sustainable urbanism in the deltaic landscape of Bangladesh.',
    rating: 4.9,
    reviewCount: 42,
    status: 'Available Now',
    location: 'Baridhara, Dhaka'
  },
  {
    id: 'p5',
    userId: 'u6',
    name: 'Prof. Selim Al-Deen',
    avatar: 'https://picsum.photos/400/400?random=55',
    category: 'Education',
    specialties: ['Curriculum Design', 'Higher Ed Consulting'],
    rates: 3000,
    experience: 25,
    languages: ['Bengali', 'English'],
    isVerified: true,
    isApproved: true,
    bio: 'Veteran educator helping institutions modernize their curricula and research strategies for the 21st century.',
    rating: 4.7,
    reviewCount: 156,
    status: 'Offline',
    location: 'Uttara, Dhaka'
  }
];

export const CATEGORIES = [
  'Legal', 'Financial', 'Medical', 'Tech', 'Architecture', 
  'Education', 'Marketing', 'HR', 'Real Estate', 'Agriculture'
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahat Chowdhury",
    role: "Tech Entrepreneur",
    content: "ProfessionalsBD saved my startup during the incorporation phase. Finding Adv. Farhan was a game-changer.",
    avatar: "https://i.pravatar.cc/150?u=rahat"
  },
  {
    id: 2,
    name: "Nusrat Jahan",
    role: "Freelance Designer",
    content: "The tax consultation I got from Tania Kabir was incredibly clear. I finally understand my taxes.",
    avatar: "https://i.pravatar.cc/150?u=nusrat"
  }
];
