import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { API_BASE_URL, API_PATHS, buildAbsoluteApiUrl } from './backend';

export { API_BASE_URL } from './backend';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const tokenStorage = {
  getAccess: () => AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh: () => AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  setAccess: (token: string) => AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  setRefresh: (token: string) => AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  setTokens: (accessToken: string, refreshToken: string) =>
    AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]),
  clearAll: () =>
    AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]),
};

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((request) => {
    if (error) request.reject(error);
    else request.resolve(token!);
  });
  failedQueue = [];
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
      if (originalRequest.url?.includes(API_PATHS.auth.refresh)) {
        await tokenStorage.clearAll();
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
        if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

        const response = await axios.post(buildAbsoluteApiUrl(API_PATHS.auth.refresh), {
          refreshToken,
        });

        const newAccessToken: string = response.data.data.accessToken;
        const newRefreshToken: string = response.data.data.refreshToken;

        await tokenStorage.setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
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

    const serverMessage =
      (error.response?.data as { message?: string } | undefined)?.message ||
      'Co loi xay ra, vui long thu lai.';

    if (!error.response) {
      return Promise.reject(new Error('Khong the ket noi den server.'));
    }

    return Promise.reject(new Error(serverMessage));
  },
);

export function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
