import { create } from 'zustand';

import { Booking } from '@/src/core/types';

import { bookingService } from '../services/bookingService';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBuyerBookings: () => Promise<void>;
  fetchMentorBookings: () => Promise<void>;
  updateBooking: (updatedBooking: Booking) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBuyerBookings: async () => {
    set({ loading: true, error: null });
    try {
      const bookings = await bookingService.getMyBookingsAsBuyer();
      set({ bookings, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Loi khi tai lich hen', loading: false });
    }
  },

  fetchMentorBookings: async () => {
    set({ loading: true, error: null });
    try {
      const bookings = await bookingService.getMyBookingsAsMentor();
      set({ bookings, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Loi khi tai lich hen', loading: false });
    }
  },

  updateBooking: (updatedBooking) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      ),
    }));
  },
}));
