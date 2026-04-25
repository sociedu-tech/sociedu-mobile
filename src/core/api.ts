import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from './config';

export { API_BASE_URL };

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

type SessionExpiredHandler = () => void | Promise<void>;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

async function notifySessionExpired() {
  await tokenStorage.clearAll();
  await sessionExpiredHandler?.();
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const tokenStorage = {
  getAccess: () => SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh: () => SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
  setAccess: (token: string) => SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token),
  setRefresh: (token: string) => SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token),
  setTokens: async (access: string, refresh: string) => {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh),
    ]);
  },
  clearAll: async () => {
    await Promise.allSettled([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
  },
};

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
      return;
    }

    prom.resolve(token ?? '');
  });
  failedQueue = [];
}

function getSafeErrorMessage(error: AxiosError): string {
  if (!error.response) {
    return 'Khong the ket noi den server.';
  }

  switch (error.response.status) {
    case 400:
      return 'Yeu cau khong hop le. Vui long kiem tra lai thong tin.';
    case 401:
      return 'Phien dang nhap da het han. Vui long dang nhap lai.';
    case 403:
      return 'Ban khong co quyen thuc hien thao tac nay.';
    case 404:
      return 'Khong tim thay du lieu.';
    case 409:
      return 'Du lieu da thay doi. Vui long tai lai va thu lai.';
    case 422:
      return 'Thong tin chua hop le. Vui long kiem tra lai.';
    default:
      return 'Co loi xay ra, vui long thu lai.';
  }
}

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        await notifySessionExpired();
        return Promise.reject(new Error('SESSION_EXPIRED'));
      }

      if (isRefreshing) {
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
        if (!refreshToken) {
          throw new Error('NO_REFRESH_TOKEN');
        }

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
        await notifySessionExpired();
        return Promise.reject(new Error('SESSION_EXPIRED'));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new Error(getSafeErrorMessage(error)));
  }
);

export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
