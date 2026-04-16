/**
 * api.ts – Axios instance với:
 *   1. Request interceptor: tự động gắn Bearer token
 *   2. Response interceptor: unwrap ApiResponse<T>, xử lý 401 + refresh retry
 *
 * Storage keys:
 *   'access_token'  – JWT access token
 *   'refresh_token' – JWT refresh token
 */
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ──────────────────────────────────────────────────
export const API_BASE_URL = 'http://192.168.102.4:9999'; // Mobile LAN IP
// iOS Simulator: dùng 'http://localhost:9999'
// Device thật: dùng IP LAN 'http://192.168.x.x:9999'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

// ─── Axios instance ───────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token helpers ────────────────────────────────────────────
export const tokenStorage = {
  getAccess: () => AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh: () => AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setAccess: (t: string) => AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, t),
  setRefresh: (t: string) => AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, t),
  setTokens: (access: string, refresh: string) =>
    AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, access],
      [STORAGE_KEYS.REFRESH_TOKEN, refresh],
    ]),
  clearAll: () =>
    AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]),
};

// ─── Flag tránh loop refresh ──────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

// ─── Request interceptor ─────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────
api.interceptors.response.use(
  // Success: response pass-through (service sẽ tự lấy .data.data)
  (response) => response,

  // Error handler
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // ── 401 → thử refresh ──────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu chính request /auth/refresh bị 401 → logout hẳn
      if (originalRequest.url?.includes('/auth/refresh')) {
        await tokenStorage.clearAll();
        // authStore.logout() sẽ được gọi từ subscriber ở _layout.tsx
        return Promise.reject(new Error('SESSION_EXPIRED'));
      }

      if (isRefreshing) {
        // Xếp hàng chờ token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefresh();
        if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const newAccess: string = res.data.data.accessToken;
        const newRefresh: string = res.data.data.refreshToken;

        await tokenStorage.setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccess}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearAll();
        return Promise.reject(new Error('SESSION_EXPIRED'));
      } finally {
        isRefreshing = false;
      }
    }

    // ── Lỗi khác ──────────────────────────────────────────
    const serverMessage =
      (error.response?.data as any)?.message ||
      'Có lỗi xảy ra, vui lòng thử lại.';

    if (!error.response) {
      return Promise.reject(new Error('Không thể kết nối đến server.'));
    }

    return Promise.reject(new Error(serverMessage));
  }
);

/**
 * Helper: unwrap ApiResponse<T>.data
 * Dùng khi service muốn lấy data nhanh mà không cần đọc message.
 */
export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
