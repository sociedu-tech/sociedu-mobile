/**
 * Types dùng chung – mirror từ sociedu-web/src/types.ts
 */

export interface MentorInfo {
  headline: string;
  expertise: string[];
  price: number;
  rating: number;
  sessionsCompleted: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  packages?: MentorPackage[];
}

export interface MentorPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'admin' | 'mentor';
  coverImage?: string;
  bio?: string;
  joinedDate: string;
  rating?: number;
  totalSales?: number;
  university?: string;
  major?: string;
  year?: number;
  gpa?: number;
  experience?: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  skills?: string[];
  achievements?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  mentorInfo?: MentorInfo;
}
