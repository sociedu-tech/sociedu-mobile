import { BookingResponseDTO, OrderResponseDTO } from '../../types';

export const mockOrdersDTO: OrderResponseDTO[] = [
  {
    id: "order-999-b1",
    buyerId: "e34a621c-a90b-4bd2-bea4-23be5185ea93",
    serviceId: "1001",
    status: "PAID",
    totalAmount: 50.0,
    paidAt: "2024-04-10T15:00:00Z",
    createdAt: "2024-04-10T14:50:00Z",
    paymentUrl: null
  }
];

export const mockBookingsDTO: BookingResponseDTO[] = [
  {
    id: "booking-01-xyz",
    orderId: "order-999-b1",
    buyerId: "e34a621c-a90b-4bd2-bea4-23be5185ea93",
    mentorId: "1",
    packageId: "101",
    status: "ACTIVE",
    createdAt: "2024-04-10T15:00:00Z",
    sessions: [
      {
        id: "session-01",
        curriculumId: "curr-1",
        title: "Khai vấn mục tiêu",
        scheduledAt: "2024-04-15T20:00:00Z",
        completedAt: null,
        status: "PENDING",
        meetingUrl: "https://meet.google.com/abc-xyz",
        evidences: []
      }
    ]
  }
];
