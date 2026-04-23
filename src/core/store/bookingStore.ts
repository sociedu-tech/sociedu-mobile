import { create } from 'zustand';
import { Booking } from '../types';
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
      set({ error: err.message || 'Lỗi khi tải lịch hẹn', loading: false });
    }
  },

  fetchMentorBookings: async () => {
     set({ loading: true, error: null });
     try {
       const bookings = await bookingService.getMyBookingsAsMentor();
       set({ bookings, loading: false });
     } catch (err: any) {
       set({ error: err.message || 'Lỗi khi tải lịch hẹn', loading: false });
     }
  },

  updateBooking: (updatedBooking) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === updatedBooking.id ? updatedBooking : b
      ),
    }));
  },
}));

// ─── SELECTORS (UI Filter Logic) ───────────────────────────────
export const getUpcomingBookings = (state: BookingState) => 
  state.bookings.filter(b => b.status === 'active');

export const getCompletedBookings = (state: BookingState) => 
  state.bookings.filter(b => b.status === 'completed');

export const getCanceledBookings = (state: BookingState) => 
  state.bookings.filter(b => b.status === 'cancelled');
