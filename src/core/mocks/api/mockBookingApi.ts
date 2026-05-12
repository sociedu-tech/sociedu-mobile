import { delay, withApiResponse } from '../utils';
import { mockBookingsDTO, mockOrdersDTO } from '../data/bookingData';
import { mockMentorListDTO } from '../data/mentorData';

export const mockOrderApi = {
  checkout: async (servicePackageVersionId: string) => {
    await delay(1200);
    const newOrder = {
      id: `order-mock-${Date.now()}`,
      buyerId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      serviceId: servicePackageVersionId,
      status: 'PENDING_PAYMENT',
      totalAmount: 50,
      createdAt: new Date().toISOString(),
      paidAt: null,
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock_vnpay...',
    };
    mockOrdersDTO.push(newOrder);
    return withApiResponse(newOrder);
  },

  getById: async (id: string) => {
    await delay(300);
    const order = mockOrdersDTO.find((item) => item.id === id);
    if (!order) throw new Error('Order not found');

    if (order.status === 'PENDING_PAYMENT') {
      order.status = 'PAID';
      order.paidAt = new Date().toISOString();

      let mentorId = '';
      let packageId = '';
      let curriculums: any[] = [];

      mockMentorListDTO.forEach((mentor) => {
        mentor.packages?.forEach((pkg) => {
          pkg.versions?.forEach((version) => {
            if (String(version.id) === order.serviceId) {
              mentorId = String(mentor.userId);
              packageId = String(pkg.id);
              curriculums = version.curriculums || [];
            }
          });
        });
      });

      const newBooking = {
        id: `booking-mock-${Date.now()}`,
        orderId: order.id,
        buyerId: order.buyerId,
        mentorId: mentorId || '1',
        packageId: packageId || '101',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        sessions: curriculums.map((curriculum: any, index: number) => ({
          id: `session-mock-${Date.now()}-${index}`,
          curriculumId: String(curriculum.id),
          title: curriculum.title,
          scheduledAt: null,
          completedAt: null,
          status: 'PENDING',
          meetingUrl: null,
          evidences: [],
        })),
      };

      mockBookingsDTO.push(newBooking);
    }

    return withApiResponse(order);
  },
};

export const mockBookingApi = {
  getMyBookingsAsBuyer: async () => {
    await delay(1000);
    const buyerId = 'e34a621c-a90b-4bd2-bea4-23be5185ea93';
    const myBookings = mockBookingsDTO.filter((booking) => booking.buyerId === buyerId);
    return withApiResponse(myBookings.reverse());
  },

  getMyBookingsAsMentor: async () => {
    await delay(1000);
    const mentorId = '1';
    const myBookings = mockBookingsDTO.filter((booking) => String(booking.mentorId) === mentorId);
    return withApiResponse(myBookings.reverse());
  },

  getById: async (id: string) => {
    await delay(600);
    const booking = mockBookingsDTO.find((item) => item.id === id);
    if (!booking) throw new Error('Booking not found');
    return withApiResponse(booking);
  },

  updateSession: async (bookingId: string, sessionId: string, data: any) => {
    await delay(800);
    const booking = mockBookingsDTO.find((item) => item.id === bookingId);
    if (!booking) throw new Error('Session not found');

    const session = booking.sessions.find((item) => item.id === sessionId);
    if (!session) throw new Error('Session not found');

    Object.assign(session, data);
    if (data.status === 'COMPLETED') {
      session.completedAt = new Date().toISOString();
    }

    const allCompleted = booking.sessions.every((item) => item.status === 'COMPLETED');
    if (allCompleted) {
      booking.status = 'COMPLETED';
    }

    return withApiResponse(session);
  },
};
