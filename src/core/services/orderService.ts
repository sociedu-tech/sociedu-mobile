/**
 * orderService.ts – Order & Payment domain service
 *
 * Endpoints:
 *   POST /api/v1/orders/checkout   → tạo đơn + nhận paymentUrl VNPay
 *   GET  /api/v1/orders/me         → danh sách đơn của tôi
 *   GET  /api/v1/orders/:id        → chi tiết đơn
 */
import { api, unwrap } from '../api';
import { OrderResponseDTO, Order } from '../types';
import { toOrder, toOrderList } from '../adapters/bookingAdapter';
import { USE_MOCK } from '../config';
import { mockOrderApi } from '../mocks/api/mockBookingApi';

const BASE = '/api/v1/orders';

export const orderService = {
  /**
   * Tạo đơn hàng từ packageVersionId → nhận paymentUrl VNPay
   *
   * Flow:
   *   1. Gọi checkout → nhận Order với paymentUrl
   *   2. Caller mở paymentUrl bằng expo-web-browser
   *   3. Sau thanh toán → polling getOrderById cho đến status = 'paid'
   *      hoặc dùng deeplink từ VNPay redirect
   */
  checkout: async (packageVersionId: number): Promise<Order> => {
    const res = USE_MOCK
      ? await mockOrderApi.checkout(packageVersionId)
      : await api.post<{ data: OrderResponseDTO }>(`${BASE}/checkout`, {
          packageVersionId,
        });
    return toOrder(unwrap(res));
  },

  /**
   * Danh sách đơn hàng của tôi
   */
  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get<{ data: OrderResponseDTO[] }>(`${BASE}/me`);
    return toOrderList(unwrap(res));
  },

  /**
   * Chi tiết đơn theo ID
   */
  getById: async (id: string): Promise<Order> => {
    const res = USE_MOCK
      ? await mockOrderApi.getById(id)
      : await api.get<{ data: OrderResponseDTO }>(`${BASE}/${id}`);
    return toOrder(unwrap(res));
  },

  /**
   * Polling helper – kiểm tra order status cho đến khi 'paid' hoặc timeout.
   * Dùng sau khi user hoàn thành thanh toán VNPay.
   *
   * @param orderId  – UUID của đơn hàng
   * @param maxRetry – Số lần thử tối đa (default: 10, interval 3s = 30s)
   */
  pollUntilPaid: async (orderId: string, maxRetry = 10): Promise<Order> => {
    for (let i = 0; i < maxRetry; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const order = await orderService.getById(orderId);
      if (order.status === 'paid' || order.status === 'cancelled') {
        return order;
      }
    }
    // Timeout nhưng vẫn trả order để caller xử lý
    return orderService.getById(orderId);
  },
};
