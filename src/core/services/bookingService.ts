/**
 * bookingService.ts – Booking domain service
 *
 * Endpoints:
 *   GET   /api/v1/bookings/me/buyer                            → bookings của tôi (mentee)
 *   GET   /api/v1/bookings/me/mentor                           → bookings của tôi (mentor)
 *   GET   /api/v1/bookings/:id                                 → chi tiết booking
 *   PATCH /api/v1/bookings/:bookingId/sessions/:sessionId      → cập nhật session
 *   POST  /api/v1/bookings/:bookingId/sessions/:sessionId/evidences → thêm minh chứng
 */
import { api, unwrap } from '../api';
import {
  BookingResponseDTO,
  BookingSessionResponseDTO,
  EvidenceResponseDTO,
  Booking,
} from '../types';
import { toBooking, toBookingList } from '../adapters/bookingAdapter';
import { USE_MOCK } from '../config';
import { mockBookingApi } from '../mocks/api/mockBookingApi';

const BASE = '/api/v1/bookings';

export const bookingService = {
  /**
   * Bookings của tôi với tư cách Mentee/Buyer
   */
  getMyBookingsAsBuyer: async (): Promise<Booking[]> => {
    const res = USE_MOCK
      ? await mockBookingApi.getMyBookingsAsBuyer()
      : await api.get<{ data: BookingResponseDTO[] }>(`${BASE}/me/buyer`);
    return toBookingList(unwrap(res));
  },

  /**
   * Bookings của tôi với tư cách Mentor
   */
  getMyBookingsAsMentor: async (): Promise<Booking[]> => {
    const res = USE_MOCK
      ? await mockBookingApi.getMyBookingsAsMentor()
      : await api.get<{ data: BookingResponseDTO[] }>(`${BASE}/me/mentor`);
    return toBookingList(unwrap(res));
  },

  /**
   * Chi tiết booking theo ID
   */
  getById: async (id: string): Promise<Booking> => {
    const res = USE_MOCK
      ? await mockBookingApi.getById(id)
      : await api.get<{ data: BookingResponseDTO }>(`${BASE}/${id}`);
    return toBooking(unwrap(res));
  },

  findByOrderId: async (orderId: string, maxRetry = 5, delayMs = 1500): Promise<Booking | null> => {
    for (let attempt = 0; attempt < maxRetry; attempt += 1) {
      const bookings = await bookingService.getMyBookingsAsBuyer();
      const found = bookings.find((item) => item.orderId === orderId);
      if (found) {
        return found;
      }

      if (attempt < maxRetry - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return null;
  },

  /**
   * Cập nhật status / meetingUrl của 1 session
   */
  updateSession: async (
    bookingId: string,
    sessionId: string,
    data: {
      status?: string;
      meetingUrl?: string;
      scheduledAt?: string;
    }
  ): Promise<BookingSessionResponseDTO> => {
    if (USE_MOCK) return unwrap(await mockBookingApi.updateSession(bookingId, sessionId, data));
    const res = await api.patch<{ data: BookingSessionResponseDTO }>(
      `${BASE}/${bookingId}/sessions/${sessionId}`,
      data
    );
    return unwrap(res);
  },

  /**
   * Thêm minh chứng buổi học (ảnh, link, text...)
   */
  addEvidence: async (
    bookingId: string,
    sessionId: string,
    data: { type: string; url: string }
  ): Promise<EvidenceResponseDTO> => {
    const res = await api.post<{ data: EvidenceResponseDTO }>(
      `${BASE}/${bookingId}/sessions/${sessionId}/evidences`,
      data
    );
    return unwrap(res);
  },

};
