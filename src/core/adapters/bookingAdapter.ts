/**
 * bookingAdapter.ts
 * Chuyển đổi BookingResponseDTO / OrderResponseDTO (backend) → mobile types
 */
import {
  BookingResponseDTO,
  BookingSessionResponseDTO,
  EvidenceResponseDTO,
  OrderResponseDTO,
  Booking,
  BookingSession,
  Order,
  SessionEvidence,
  BookingStatus,
  SessionStatus,
  OrderStatus,
} from '../types';

// ─── Status normalizers ───────────────────────────────────────

function toBookingStatus(raw: string): BookingStatus {
  const map: Record<string, BookingStatus> = {
    ACTIVE: 'active',
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELED: 'cancelled',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  };
  return map[raw?.toUpperCase()] ?? 'active';
}

function toSessionStatus(raw: string): SessionStatus {
  const map: Record<string, SessionStatus> = {
    PENDING: 'pending',
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show',
    CANCELED: 'cancelled',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  };
  return map[raw?.toUpperCase()] ?? 'pending';
}

function toOrderStatus(raw: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  };
  return map[raw?.toUpperCase()] ?? 'pending_payment';
}

// ─── Converters ───────────────────────────────────────────────

function toEvidence(dto: EvidenceResponseDTO): SessionEvidence {
  return {
    id: dto?.id ?? '',
    type: dto?.type ?? 'unknown',
    url: dto?.url ?? '',
    uploadedAt: dto?.uploadedAt ?? '',
  };
}

function toSession(dto: BookingSessionResponseDTO): BookingSession {
  return {
    id: dto?.id ?? '',
    curriculumId: dto?.curriculumId ?? '',
    title: dto?.title ?? 'Buổi học',
    scheduledAt: dto?.scheduledAt ?? null,
    completedAt: dto?.completedAt ?? null,
    status: toSessionStatus(dto?.status),
    meetingUrl: dto?.meetingUrl ?? null,
    evidences: (dto?.evidences ?? []).map(toEvidence),
    reviewed: dto?.reviewed,
    hasReviewed: dto?.hasReviewed,
  };
}

export function toBooking(dto: BookingResponseDTO): Booking {
  return {
    id: dto?.id ?? '',
    orderId: dto?.orderId ?? '',
    buyerId: dto?.buyerId ?? '',
    mentorId: dto?.mentorId ?? '',
    packageId: dto?.packageId ?? '',
    status: toBookingStatus(dto?.status),
    createdAt: dto?.createdAt ?? '',
    sessions: (dto?.sessions ?? []).map(toSession),
    mentorName: dto?.mentorName,
    packageName: dto?.packageName,
  };
}

export function toBookingList(dtos: BookingResponseDTO[]): Booking[] {
  return (dtos ?? []).map(toBooking);
}

export function toOrder(dto: OrderResponseDTO): Order {
  return {
    id: dto?.id ?? '',
    buyerId: dto?.buyerId ?? '',
    serviceId: dto?.serviceId ?? '',
    status: toOrderStatus(dto?.status),
    totalAmount: Number(dto?.totalAmount ?? 0),
    paidAt: dto?.paidAt ?? null,
    createdAt: dto?.createdAt ?? '',
    paymentUrl: dto?.paymentUrl ?? null,
  };
}

export function toOrderList(dtos: OrderResponseDTO[]): Order[] {
  return (dtos ?? []).map(toOrder);
}
