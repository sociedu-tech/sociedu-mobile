import { BookingSessionResponseDTO } from '../../types';
import { delay, withApiResponse } from '../utils';
import { mockBookingsDTO, mockOrdersDTO } from '../data/bookingData';

export const mockOrderApi = {
  checkout: async (payload: { packageVersionId: number; slotId: string }) => {
    await delay(1200);

    return withApiResponse({
      id: 'order-pending-new',
      buyerId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      serviceId: String(payload.packageVersionId),
      status: 'PENDING_PAYMENT',
      totalAmount: 50,
      createdAt: new Date().toISOString(),
      paidAt: null,
      paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mock_vnpay&slotId=${payload.slotId}`,
    });
  },

  getMyOrders: async () => {
    await delay(500);
    return withApiResponse(mockOrdersDTO);
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
    return withApiResponse(mockBookingsDTO);
  },

  getById: async (id: string) => {
    await delay(600);
    return withApiResponse(mockBookingsDTO.find((item) => item.id === id) ?? mockBookingsDTO[0]);
  },

  updateSession: async (
    _bookingId: string,
    _sessionId: string,
    data: Partial<BookingSessionResponseDTO>
  ) => {
    await delay(800);
    return withApiResponse({ ...mockBookingsDTO[0].sessions[0], ...data });
  },

  addEvidence: async (_bookingId: string, _sessionId: string, data: { type: string; url: string }) => {
    await delay(400);
    const evidence = {
      id: `evidence-${Date.now()}`,
      type: data.type,
      url: data.url,
      uploadedAt: new Date().toISOString(),
    };
    mockBookingsDTO[0].sessions[0].evidences.push(evidence);
    return withApiResponse(evidence);
  },
};
