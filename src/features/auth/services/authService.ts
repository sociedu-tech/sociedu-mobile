import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, STORAGE_KEYS, tokenStorage, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockAuthApi } from '@/src/core/mocks/api/mockAuthApi';
import { AuthResponseDTO, LoginRequestDTO, RegisterRequestDTO } from '@/src/core/types';

import { AuthUser, toAuthUser } from '../adapters/authAdapter';

const BASE = '/api/v1/auth';

export const authService = {
  login: async (credentials: LoginRequestDTO): Promise<AuthUser> => {
    let dto: AuthResponseDTO;

    if (USE_MOCK) {
      dto = unwrap(await mockAuthApi.login(credentials));
    } else {
      const res = await api.post<{ data: AuthResponseDTO }>(`${BASE}/login`, credentials);
      dto = unwrap(res);
    }

    const user = toAuthUser(dto);

    await tokenStorage.setTokens(dto.accessToken, dto.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  },

  register: async (data: RegisterRequestDTO): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const mockRes = await mockAuthApi.register(data);
      return mockRes.data;
    }

    const res = await api.post(`${BASE}/register`, data);
    return { message: res.data.message ?? 'Dang ky thanh cong. Vui long kiem tra email.' };
  },

  logout: async (): Promise<void> => {
    try {
      if (USE_MOCK) {
        await mockAuthApi.logout();
      } else {
        const refreshToken = await tokenStorage.getRefresh();
        if (refreshToken) {
          await api.post(`${BASE}/logout`, { refreshToken });
        }
      }
    } finally {
      await tokenStorage.clearAll();
    }
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockAuthApi.refresh(refreshToken));
    }

    const res = await api.post<{ data: AuthResponseDTO }>(`${BASE}/refresh`, { refreshToken });
    return unwrap(res);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post(`${BASE}/forgot-password`, { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post(`${BASE}/reset-password`, { token, newPassword });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post(`${BASE}/verify-email`, { token });
  },

  resendVerification: async (email: string): Promise<void> => {
    await api.post(`${BASE}/resend-verification`, { email });
  },

  getCachedUser: async (): Promise<AuthUser | null> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
};
