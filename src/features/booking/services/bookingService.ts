import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockBookingApi } from '@/src/core/mocks/api/mockBookingApi';
import {
  Booking,
  BookingResponseDTO,
  BookingSessionResponseDTO,
  EvidenceResponseDTO,
} from '@/src/core/types';

import { toBooking, toBookingList } from '../adapters/bookingAdapter';

const BASE = '/api/v1/bookings';

export const bookingService = {
  getMyBookingsAsBuyer: async (): Promise<Booking[]> => {
    const res = USE_MOCK
      ? await mockBookingApi.getMyBookingsAsBuyer()
      : await api.get<{ data: BookingResponseDTO[] }>(`${BASE}/me/buyer`);

    return toBookingList(unwrap(res));
  },

  getMyBookingsAsMentor: async (): Promise<Booking[]> => {
    const res = USE_MOCK
      ? await mockBookingApi.getMyBookingsAsMentor()
      : await api.get<{ data: BookingResponseDTO[] }>(`${BASE}/me/mentor`);

    return toBookingList(unwrap(res));
  },

  getById: async (id: string): Promise<Booking> => {
    const res = USE_MOCK
      ? await mockBookingApi.getById(id)
      : await api.get<{ data: BookingResponseDTO }>(`${BASE}/${id}`);

    return toBooking(unwrap(res));
  },

  updateSession: async (
    bookingId: string,
    sessionId: string,
    data: {
      status?: string;
      meetingUrl?: string;
      scheduledAt?: string;
    }
  ): Promise<BookingSessionResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockBookingApi.updateSession(bookingId, sessionId, data));
    }

    const res = await api.patch<{ data: BookingSessionResponseDTO }>(
      `${BASE}/${bookingId}/sessions/${sessionId}`,
      data
    );
    return unwrap(res);
  },

  addEvidence: async (
    bookingId: string,
    sessionId: string,
    data: { fileId: string; description?: string }
  ): Promise<EvidenceResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockBookingApi.addEvidence(bookingId, sessionId, data));
    }

    return unwrap(
      await api.post<{ data: EvidenceResponseDTO }>(
        `${BASE}/${bookingId}/sessions/${sessionId}/evidences`,
        data
      )
    );
  },
};
