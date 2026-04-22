import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockOrderApi } from '@/src/core/mocks/api/mockBookingApi';
import { Order, OrderResponseDTO } from '@/src/core/types';

import { toOrder, toOrderList } from '../adapters/bookingAdapter';

const BASE = '/api/v1/orders';

export const orderService = {
  checkout: async (packageVersionId: number): Promise<Order> => {
    const res = USE_MOCK
      ? await mockOrderApi.checkout(packageVersionId)
      : await api.post<{ data: OrderResponseDTO }>(`${BASE}/checkout`, {
          packageVersionId,
        });

    return toOrder(unwrap(res));
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get<{ data: OrderResponseDTO[] }>(`${BASE}/me`);
    return toOrderList(unwrap(res));
  },

  getById: async (id: string): Promise<Order> => {
    const res = USE_MOCK
      ? await mockOrderApi.getById(id)
      : await api.get<{ data: OrderResponseDTO }>(`${BASE}/${id}`);

    return toOrder(unwrap(res));
  },

  pollUntilPaid: async (orderId: string, maxRetry = 10): Promise<Order> => {
    for (let i = 0; i < maxRetry; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const order = await orderService.getById(orderId);
      if (order.status === 'paid' || order.status === 'cancelled') {
        return order;
      }
    }

    return orderService.getById(orderId);
  },
};
