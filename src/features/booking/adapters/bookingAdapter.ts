import {
  Booking,
  BookingResponseDTO,
  BookingSession,
  BookingSessionResponseDTO,
  BookingStatus,
  EvidenceResponseDTO,
  Order,
  OrderResponseDTO,
  OrderStatus,
  SessionEvidence,
  SessionStatus,
} from '@/src/core/types';

function toBookingStatus(raw: string): BookingStatus {
  const map: Record<string, BookingStatus> = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  return map[raw?.toUpperCase()] ?? 'active';
}

function toSessionStatus(raw: string): SessionStatus {
  const map: Record<string, SessionStatus> = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  return map[raw?.toUpperCase()] ?? 'pending';
}

function toOrderStatus(raw: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  };

  return map[raw?.toUpperCase()] ?? 'pending_payment';
}

function toEvidence(dto: EvidenceResponseDTO): SessionEvidence {
  return {
    id: dto.id,
    fileId: dto.fileId,
    uploadedBy: dto.uploadedBy,
    description: dto.description ?? null,
    uploadedAt: dto.createdAt,
  };
}

function toSession(dto: BookingSessionResponseDTO): BookingSession {
  return {
    id: dto.id,
    curriculumId: dto.curriculumId,
    title: dto.title,
    scheduledAt: dto.scheduledAt ?? null,
    completedAt: dto.completedAt ?? null,
    status: toSessionStatus(dto.status),
    meetingUrl: dto.meetingUrl ?? null,
    evidences: (dto.evidences ?? []).map(toEvidence),
  };
}

export function toBooking(dto: BookingResponseDTO): Booking {
  return {
    id: dto.id,
    orderId: dto.orderId,
    buyerId: dto.buyerId,
    mentorId: dto.mentorId,
    packageId: dto.packageId,
    status: toBookingStatus(dto.status),
    createdAt: dto.createdAt,
    sessions: (dto.sessions ?? []).map(toSession),
  };
}

export function toBookingList(dtos: BookingResponseDTO[]): Booking[] {
  return (dtos ?? []).map(toBooking);
}

export function toOrder(dto: OrderResponseDTO): Order {
  return {
    id: dto.id,
    buyerId: dto.buyerId,
    serviceId: dto.serviceId,
    status: toOrderStatus(dto.status),
    totalAmount: Number(dto.totalAmount),
    paidAt: dto.paidAt ?? null,
    createdAt: dto.createdAt,
    paymentUrl: dto.paymentUrl ?? null,
  };
}

export function toOrderList(dtos: OrderResponseDTO[]): Order[] {
  return (dtos ?? []).map(toOrder);
}
