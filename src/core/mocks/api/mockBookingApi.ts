import { delay, withApiResponse } from '../utils';
import { mockBookingsDTO, mockOrdersDTO } from '../data/bookingData';

export const mockOrderApi = {
  checkout: async (packageVersionId: number) => {
    await delay(1200);

    return withApiResponse({
      id: 'order-pending-new',
      buyerId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      serviceId: String(packageVersionId),
      status: 'PENDING_PAYMENT',
      totalAmount: 50,
      createdAt: new Date().toISOString(),
      paidAt: null,
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock_vnpay...',
    });
  },

  getById: async (id: string) => {
    await delay(300);

    return withApiResponse({
      ...mockOrdersDTO[0],
      id,
      status: 'PAID',
    });
  },
};

export const mockBookingApi = {
  getMyBookingsAsBuyer: async () => {
    await delay(1000);
    return withApiResponse(mockBookingsDTO);
  },

  getMyBookingsAsMentor: async () => {
    await delay(1000);
    return withApiResponse([]);
  },

  getById: async (id: string) => {
    await delay(600);
    return withApiResponse(mockBookingsDTO.find((item) => item.id === id) ?? mockBookingsDTO[0]);
  },

  updateSession: async (_bookingId: string, _sessionId: string, data: any) => {
    await delay(800);
    return withApiResponse({ ...mockBookingsDTO[0].sessions[0], ...data });
  },
};
