import { delay, withApiResponse } from '../utils';
import { mockBookingsDTO, mockOrdersDTO } from '../data/bookingData';
import { mockMentorListDTO } from '../data/mentorData';

export const mockOrderApi = {
  checkout: async (packageVersionId: number) => {
    await delay(1200);
    // Trả ra một order PENDING_PAYMENT kèm Link VNPay mock.
    const newOrder = {
       id: `order-mock-${Date.now()}`,
       buyerId: "e34a621c-a90b-4bd2-bea4-23be5185ea93",
       serviceId: String(packageVersionId),
       status: "PENDING_PAYMENT",
       totalAmount: 50,
       createdAt: new Date().toISOString(),
       paidAt: null,
       paymentUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock_vnpay..."
    };
    mockOrdersDTO.push(newOrder);
    return withApiResponse(newOrder);
  },

  getById: async (id: string) => {
    await delay(300);
    const order = mockOrdersDTO.find(o => o.id === id);
    if (!order) throw new Error("Order not found");

    // Nếu đơn hàng đang PENDING_PAYMENT, giả lập quá trình VNPay thanh toán xong 
    // và hệ thống tự động sinh ra Booking.
    if (order.status === "PENDING_PAYMENT") {
      order.status = "PAID";
      order.paidAt = new Date().toISOString();

      // Tìm thông tin Package & Curriculum từ Mentor mock data
      let mentorId = "";
      let packageId = "";
      let curriculums: any[] = [];
      
      mockMentorListDTO.forEach(m => {
        m.packages?.forEach(p => {
          p.versions?.forEach(v => {
            if (String(v.id) === order.serviceId) {
              mentorId = String(m.userId);
              packageId = String(p.id);
              curriculums = v.curriculums || [];
            }
          });
        });
      });

      // Tạo Booking tương ứng
      const newBooking = {
        id: `booking-mock-${Date.now()}`,
        orderId: order.id,
        buyerId: order.buyerId,
        mentorId: mentorId || "1",
        packageId: packageId || "101",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        sessions: curriculums.map((c: any, index: number) => ({
          id: `session-mock-${Date.now()}-${index}`,
          curriculumId: String(c.id),
          title: c.title,
          scheduledAt: null,
          completedAt: null,
          status: "PENDING",
          meetingUrl: null,
          evidences: []
        }))
      };
      
      mockBookingsDTO.push(newBooking);
    }

    return withApiResponse(order);
  }
};

export const mockBookingApi = {
  getMyBookingsAsBuyer: async () => {
    await delay(1000);
    const buyerId = "e34a621c-a90b-4bd2-bea4-23be5185ea93";
    const myBookings = mockBookingsDTO.filter(b => b.buyerId === buyerId);
    return withApiResponse(myBookings.reverse()); // Hiển thị mới nhất trước
  },

  getMyBookingsAsMentor: async () => {
    await delay(1000);
    const mentorId = "1";
    const myBookings = mockBookingsDTO.filter(b => String(b.mentorId) === mentorId);
    return withApiResponse(myBookings.reverse());
  },

  getById: async (id: string) => {
    await delay(600);
    const b = mockBookingsDTO.find(x => x.id === id);
    if (!b) throw new Error("Booking not found");
    return withApiResponse(b);
  },

  updateSession: async (bookingId: string, sessionId: string, data: any) => {
    await delay(800);
    const booking = mockBookingsDTO.find(x => x.id === bookingId);
    if (booking) {
      const session = booking.sessions.find(s => s.id === sessionId);
      if (session) {
        Object.assign(session, data);
        if (data.status === 'COMPLETED') {
          session.completedAt = new Date().toISOString();
        }
        
        // Kiểm tra xem tất cả các session đã complete chưa
        const allCompleted = booking.sessions.every(s => s.status === 'COMPLETED');
        if (allCompleted) {
          booking.status = 'COMPLETED';
        }
        return withApiResponse(session);
      }
    }
    throw new Error("Session not found");
  },

  cancelBooking: async (bookingId: string) => {
    await delay(500);
    const booking = mockBookingsDTO.find(x => x.id === bookingId);
    if (!booking) throw new Error("Booking not found");

    booking.status = 'CANCELED';
    booking.sessions.forEach((session) => {
      if (session.status !== 'COMPLETED') {
        session.status = 'CANCELED';
      }
    });
    return withApiResponse(null);
  },

  submitReview: async (bookingId: string, data: { rating: number; comment: string }) => {
    await delay(500);
    const booking = mockBookingsDTO.find(x => x.id === bookingId);
    if (!booking) throw new Error("Booking not found");

    const completedSession = booking.sessions.find((session) => session.status === 'COMPLETED');
    if (completedSession) {
      completedSession.reviewed = true;
      completedSession.hasReviewed = true;
    }

    return withApiResponse({ id: `review-mock-${Date.now()}`, bookingId, ...data });
  }
};
