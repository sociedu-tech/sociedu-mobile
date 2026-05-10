import { toOrder, toOrderList } from '../adapters/bookingAdapter';
import { API_PATHS } from '../backend';
import { USE_MOCK } from '../config';
import { mockOrderApi } from '../mocks/api/mockBookingApi';
import { api, unwrap } from '../api';
import { OrderResponseDTO, Order } from '../types';

export const orderService = {
  checkout: async (packageVersionId: number): Promise<Order> => {
    const response = USE_MOCK
      ? await mockOrderApi.checkout(packageVersionId)
      : await api.post<{ data: OrderResponseDTO }>(API_PATHS.orders.checkout, {
          packageVersionId,
        });

    return toOrder(unwrap(response));
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<{ data: OrderResponseDTO[] }>(API_PATHS.orders.mine);
    return toOrderList(unwrap(response));
  },

  getById: async (id: string): Promise<Order> => {
    const response = USE_MOCK
      ? await mockOrderApi.getById(id)
      : await api.get<{ data: OrderResponseDTO }>(API_PATHS.orders.byId(id));

    return toOrder(unwrap(response));
  },

  pollUntilPaid: async (orderId: string, maxRetry = 10): Promise<Order> => {
    for (let attempt = 0; attempt < maxRetry; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const order = await orderService.getById(orderId);
      if (order.status === 'paid' || order.status === 'failed' || order.status === 'cancelled') {
        return order;
      }
    }

    return orderService.getById(orderId);
  },
};
