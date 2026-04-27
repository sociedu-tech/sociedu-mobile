import { api, unwrap } from '@/src/core/api';
import { API_PATHS } from '@/src/core/backend';
import { USE_MOCK } from '@/src/core/config';
import { mockBookingApi } from '@/src/core/mocks/api/mockBookingApi';
import {
  Booking,
  BookingResponseDTO,
  BookingSessionResponseDTO,
  EvidenceResponseDTO,
} from '@/src/core/types';

import { toBooking, toBookingList } from '../adapters/bookingAdapter';

export const bookingService = {
  getMyBookingsAsBuyer: async (): Promise<Booking[]> => {
    const res = USE_MOCK
      ? await mockBookingApi.getMyBookingsAsBuyer()
      : await api.get<{ data: BookingResponseDTO[] }>(API_PATHS.bookings.mineBuyer);

    return toBookingList(unwrap(res));
  },

  getMyBookingsAsMentor: async (): Promise<Booking[]> => {
    const res = USE_MOCK
      ? await mockBookingApi.getMyBookingsAsMentor()
      : await api.get<{ data: BookingResponseDTO[] }>(API_PATHS.bookings.mineMentor);

    return toBookingList(unwrap(res));
  },

  getById: async (id: string): Promise<Booking> => {
    const res = USE_MOCK
      ? await mockBookingApi.getById(id)
      : await api.get<{ data: BookingResponseDTO }>(API_PATHS.bookings.byId(id));

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
      API_PATHS.bookings.session(bookingId, sessionId),
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
        API_PATHS.bookings.evidences(bookingId, sessionId),
        data
      )
    );
  },
};
