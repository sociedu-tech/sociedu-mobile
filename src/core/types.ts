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

export interface SendLoginOtpRequestDTO {
  email: string;
}

export interface LoginOtpRequestDTO {
  email: string;
  otpCode: string;
}

export interface SendPhoneOtpRequestDTO {
  phoneNumber: string;
}

export interface VerifyPhoneOtpRequestDTO {
  phoneNumber: string;
  otpCode: string;
}

export interface SessionMeResponseDTO {
  userId: string;
  email: string;
  emailVerified: boolean;
  status: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string | null;
  avatarUrl: string | null;
  roles: string[];
  capabilities: string[];
  createdAt: string;
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
  isActive?: boolean;
  hasOrders?: boolean;
  isEditable?: boolean;
  curriculums?: CurriculumItemResponseDTO[]; // Null-safe array
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

export interface CreateCurriculumRequest {
  title: string;
  description: string;
  orderIndex: number;
  duration: number;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  isActive: boolean;
  versions: {
    price: number;
    duration: number;
    deliveryType: string;
    isDefault: boolean;
    curriculums: CreateCurriculumRequest[];
  }[];
}

export interface UpdateServiceRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreatePackageVersionRequest {
  price: number;
  duration: number;
  deliveryType: string;
  isDefault: boolean;
  isActive: boolean;
  curriculums: CreateCurriculumRequest[];
}

export interface UpdatePackageVersionRequest extends CreatePackageVersionRequest {}

export interface UpdateMentorProfileRequest {
  headline: string;
  expertise: string;
  basePrice: number;
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

export type ConversationApiType = 'general' | 'booking' | 'support';
export type MessageApiType = 'text' | 'image' | 'file' | 'system';

export interface ConversationParticipantResponseDTO {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface ConversationLastMessageResponseDTO {
  text: string;
  createdAt: string;
  senderId: string;
}

export interface ConversationResponseDTO {
  id: string;
  type: ConversationApiType;
  bookingId: string | null;
  participants: ConversationParticipantResponseDTO[];
  lastMessage: ConversationLastMessageResponseDTO | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachmentResponseDTO {
  id: string;
  url: string;
  type: string;
}

export interface MessageResponseDTO {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageApiType;
  content: string;
  attachments: MessageAttachmentResponseDTO[];
  isEdited: boolean;
  createdAt: string;
}

export interface ProgressReportResponseDTO {
  id: string;
  menteeId: string;
  menteeName: string;
  mentorId: string;
  bookingId: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  status: 'submitted' | 'reviewed' | 'needs_revision';
  mentorFeedback: string | null;
  feedbackAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Report & Dispute ──────────────────────────────────────────
export type ReportType = 'user' | 'message' | 'booking' | 'session' | 'review' | 'comment';
export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'rejected';

export interface ReportResponseDTO {
  id: string;
  reporterId: string;
  targetType: ReportType;
  targetId: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  evidenceFiles: EvidenceResponseDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportRequest {
  targetType: ReportType;
  targetId: string;
  reason: string;
  description?: string;
  evidenceFileIds?: string[];
}

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer'
  | 'resolved_mentor'
  | 'partial_refund'
  | 'closed';

export interface DisputeResponseDTO {
  id: string;
  reportId: string | null;
  bookingId: string | null;
  sessionId: string | null;
  reason: string;
  status: DisputeStatus;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  reportId?: string;
  bookingId?: string;
  sessionId?: string;
  reason: string;
}

// ─────────────────────────────────────────────────────────────
// MOBILE TYPES  (dùng trong UI, sau khi qua adapter)
// ─────────────────────────────────────────────────────────────

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
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

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  duration: number;
}

export interface MentorPackageVersion {
  id: string;
  price: number;
  duration: number;
  deliveryType: string;
  isDefault: boolean;
  isActive?: boolean;
  hasOrders?: boolean;
  isEditable?: boolean;
  curriculums: CurriculumItem[];
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
export type ConversationType = ConversationApiType;

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}

export interface ConversationPreview {
  text: string;
  createdAt: Date | null;
  senderId: string | null;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  bookingId: string | null;
  participants: ConversationParticipant[];
  peer: ConversationParticipant | null;
  name: string;
  avatar: string | null;
  lastMessage: ConversationPreview | null;
  lastMessageText: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  url: string;
  type: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageApiType;
  content: string;
  attachments: MessageAttachment[];
  isEdited: boolean;
  createdAt: Date;
  isMine: boolean;
}

export interface SubmitFeedbackRequest {
  feedback: string;
  status: 'reviewed' | 'needs_revision';
}

export interface CreateProgressReportRequest {
  bookingId: string;
  title: string;
  content: string;
  attachmentUrl?: string | null;
}

export interface ProgressReport {
  id: string;
  menteeId: string;
  menteeName: string;
  mentorId: string;
  bookingId: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  status: 'submitted' | 'reviewed' | 'needs_revision';
  mentorFeedback: string | null;
  feedbackAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  targetType: ReportType;
  targetId: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  evidenceFiles: SessionEvidence[];
  createdAt: Date;
}

export interface Dispute {
  id: string;
  bookingId: string | null;
  sessionId: string | null;
  reason: string;
  status: DisputeStatus;
  resolutionNote: string | null;
  createdAt: Date;
}
