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
  mentorVerificationStatus?: string | null;
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

export interface VerifyResetPasswordOtpRequestDTO {
  email: string;
  otp: string;
}

export interface VerifyResetPasswordOtpResponseDTO {
  resetToken: string;
  expiresIn: number;
}

export interface CompleteResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

// ── Mentor / Service ──────────────────────────────────────────
export interface MentorProfileResponseDTO {
  userId: string;                 // UUID
  displayName?: string | null;
  headline: string;
  expertise: string;              // comma-separated "React,Node.js"
  basePrice: number;              // BigDecimal
  ratingAvg: number | null;       // Float
  sessionsCompleted: number;
  verificationStatus: string;     // "PENDING" | "VERIFIED" | "REJECTED"
  packages: ServicePackageResponseDTO[];
}

export interface ServicePackageVersionResponseDTO {
  id: string;
  price: number;
  duration: number;               // minutes
  deliveryType: string;
  isDefault: boolean;
  curriculums?: CurriculumItemResponseDTO[];
}

export interface ServicePackageResponseDTO {
  id: string;
  mentorId: string;
  name: string;
  description: string;
  isActive: boolean;
  versions: ServicePackageVersionResponseDTO[];
}

export interface CurriculumItemResponseDTO {
  id: string;
  packageVersionId: string;
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
  servicePackageVersionId: string;
  orderInfo?: string;
}

// ── Booking ───────────────────────────────────────────────────
export interface EvidenceResponseDTO {
  id: string;
  uploadedBy: string;
  fileId: string;
  description: string | null;
  createdAt: string;
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
  id: string;
  userId: string;
  universityId: string | null;
  majorId: string | null;
  universityName: string | null;
  majorName: string | null;
  degree: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean | null;
  description: string | null;
}

export interface UserExperienceResponseDTO {
  id: string;
  userId: string;
  company: string;
  position: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean | null;
  description: string | null;
}

export interface UserLanguageResponseDTO {
  id: string;
  userId: string;
  language: string;
  level: string;
}

export interface UserCertificateResponseDTO {
  id: string;
  userId: string;
  name: string;
  organization: string;
  issueDate: string | null;
  expirationDate: string | null;
  credentialFileId: string | null;
  description: string | null;
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
  curriculums: CurriculumItem[];
}

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  duration: number;
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
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number | null;
}

export interface UserExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export interface UserLanguage {
  id: string;
  language: string;
  proficiency: string;
}

export interface UserCertificate {
  id: string;
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
  fileId: string;
  uploadedBy: string;
  description: string | null;
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

export interface AvailabilitySlot {
  id: string;
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
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

// ── Report & Dispute DTOs ─────────────────────────────────────
export type ReportEntityType = 'user' | 'message' | 'booking' | 'session' | 'review' | 'comment';
export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'rejected';
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer'
  | 'resolved_mentor'
  | 'partial_refund'
  | 'closed';

export interface ReportRequestDTO {
  entityType: string;
  entityId: string;
  reason: string;
  description: string;
}

export interface ReportEvidenceResponseDTO {
  id: string;
  reportId: string;
  fileId: string;
  createdAt: string;
}

export interface ReportResponseDTO {
  id: string;
  reporterId: string;
  entityType: string;
  entityId: string;
  reason: string;
  description: string;
  status: string;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  evidences: ReportEvidenceResponseDTO[];
}

export interface DisputeRequestDTO {
  reportId?: string;
  bookingId?: string;
  sessionId?: string;
  reason: string;
  description: string;
}

export interface DisputeResponseDTO {
  id: string;
  reportId: string | null;
  bookingId: string | null;
  sessionId: string | null;
  openedBy: string;
  reason: string;
  description: string;
  status: string;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Progress Report DTOs ──────────────────────────────────────
export type ProgressReportStatus = 'draft' | 'submitted' | 'reviewed';

export interface ProgressReportResponseDTO {
  id: string;
  menteeId: string;
  mentorId: string;
  bookingId: string | null;
  title: string;
  content: string;
  attachmentUrl: string | null;
  status: string;
  mentorFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgressReportDTO {
  bookingId?: string;
  title: string;
  content: string;
}

// ── Mobile types for Report/Dispute/Progress ──────────────────

export interface Report {
  id: string;
  reporterId: string;
  entityType: ReportEntityType;
  entityId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  evidences: ReportEvidence[];
}

export interface ReportEvidence {
  id: string;
  reportId: string;
  fileId: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reportId: string | null;
  bookingId: string | null;
  sessionId: string | null;
  openedBy: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressReport {
  id: string;
  menteeId: string;
  mentorId: string;
  bookingId: string | null;
  title: string;
  content: string;
  attachmentUrl: string | null;
  status: ProgressReportStatus;
  mentorFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}
