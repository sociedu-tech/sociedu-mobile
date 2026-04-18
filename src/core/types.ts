/**
 * types.ts – Mirror từ backend DTOs (sociedu-api)
 * Phân chia 2 nhóm:
 *   1. Backend DTOs  – khớp 1:1 với Java response classes
 *   2. Mobile Types  – dùng trong UI (sau khi qua adapter)
 */

// ─────────────────────────────────────────────────────────────
// BACKEND DTOs  (khớp schema Java)
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  code: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: Record<string, unknown>;
  timestamp: string;
}

// ── Auth ──────────────────────────────────────────────────────
export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;         // seconds
  userId: string;            // UUID
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];           // e.g. ["ROLE_USER", "ROLE_MENTOR"]
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

// ── Mentor / Service ──────────────────────────────────────────
export interface MentorProfileResponseDTO {
  userId: number;                 // Long
  headline: string;
  expertise: string;              // comma-separated "React,Node.js"
  basePrice: number;              // BigDecimal
  ratingAvg: number | null;       // Float
  sessionsCompleted: number;
  verificationStatus: string;     // "PENDING" | "VERIFIED" | "REJECTED"
  packages: ServicePackageResponseDTO[];
}

export interface ServicePackageVersionResponseDTO {
  id: number;
  price: number;
  duration: number;               // minutes
  deliveryType: string;
  isDefault: boolean;
}

export interface ServicePackageResponseDTO {
  id: number;
  mentorId: number;
  name: string;
  description: string;
  isActive: boolean;
  versions: ServicePackageVersionResponseDTO[];
}

export interface CurriculumItemResponseDTO {
  id: number;
  packageVersionId: number;
  title: string;
  description: string;
  orderIndex: number;
  duration: number;              // minutes
}

// ── Order ─────────────────────────────────────────────────────
export interface OrderResponseDTO {
  id: string;                    // UUID
  buyerId: string;               // UUID
  serviceId: string;             // UUID (packageVersionId)
  status: string;                // "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "REFUNDED"
  totalAmount: number;           // BigDecimal
  paidAt: string | null;         // Instant ISO
  createdAt: string;
  paymentUrl: string | null;
}

export interface CheckoutRequestDTO {
  packageVersionId: number;
}

// ── Booking ───────────────────────────────────────────────────
export interface EvidenceResponseDTO {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface BookingSessionResponseDTO {
  id: string;                    // UUID
  curriculumId: string;
  title: string;
  scheduledAt: string | null;
  completedAt: string | null;
  status: string;               // "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  meetingUrl: string | null;
  evidences: EvidenceResponseDTO[];
}

export interface BookingResponseDTO {
  id: string;                    // UUID
  orderId: string;
  buyerId: string;
  mentorId: string;
  packageId: string;
  status: string;               // "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string;
  sessions: BookingSessionResponseDTO[];
}

// ── User ──────────────────────────────────────────────────────
export interface UserProfileResponseDTO {
  userId: string;               // UUID
  firstName: string;
  lastName: string;
  headline: string | null;
  avatarFileId: string | null;  // UUID – cần build URL
  bio: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserEducationResponseDTO {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
}

export interface UserExperienceResponseDTO {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export interface UserLanguageResponseDTO {
  id: number;
  language: string;
  proficiency: string;
}

export interface UserCertificateResponseDTO {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
}

export interface UserFullProfileResponseDTO {
  profile: UserProfileResponseDTO;
  educations: UserEducationResponseDTO[];
  languages: UserLanguageResponseDTO[];
  experiences: UserExperienceResponseDTO[];
  certificates: UserCertificateResponseDTO[];
}

// ─────────────────────────────────────────────────────────────
// MOBILE TYPES  (dùng trong UI, sau khi qua adapter)
// ─────────────────────────────────────────────────────────────

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type BookingStatus = 'active' | 'completed' | 'cancelled';
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled' | 'refunded';
export type UserRole = 'user' | 'mentor' | 'admin';

export interface MentorPackage {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  versions: MentorPackageVersion[];
}

export interface MentorPackageVersion {
  id: string;
  price: number;
  duration: number;
  deliveryType: string;
  isDefault: boolean;
}

export interface MentorInfo {
  headline: string;
  expertise: string[];
  price: number;
  rating: number;
  sessionsCompleted: number;
  verificationStatus: VerificationStatus;
  packages?: MentorPackage[];
}

export interface UserEducation {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
}

export interface UserExperience {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export interface UserLanguage {
  id: number;
  language: string;
  proficiency: string;
}

export interface UserCertificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  bio?: string;
  headline?: string;
  location?: string;
  joinedDate: string;
  rating?: number;
  mentorInfo?: MentorInfo;
  educations?: UserEducation[];
  experiences?: UserExperience[];
  languages?: UserLanguage[];
  certificates?: UserCertificate[];
}

export interface SessionEvidence {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface BookingSession {
  id: string;
  curriculumId: string;
  title: string;
  scheduledAt: string | null;
  completedAt: string | null;
  status: SessionStatus;
  meetingUrl: string | null;
  evidences: SessionEvidence[];
}

export interface Booking {
  id: string;
  orderId: string;
  buyerId: string;
  mentorId: string;
  packageId: string;
  status: BookingStatus;
  createdAt: string;
  sessions: BookingSession[];
}

export interface Order {
  id: string;
  buyerId: string;
  serviceId: string;
  status: OrderStatus;
  totalAmount: number;
  paidAt: string | null;
  createdAt: string;
  paymentUrl: string | null;
}

// ── Chat ──────────────────────────────────────────────────────
export type ConversationType = 'chat' | 'session' | 'follow-up';

export interface ChatMessage {
  id: string;
  sender: 'mentee' | 'mentor';
  text: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  status: 'pending' | 'confirmed' | 'completed';
  mentorName: string;
  subject: string;
  startTime: number;
  endTime: number;
  price: number;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  type: ConversationType;
  sessionId?: string;
  isPinned?: boolean;
}
