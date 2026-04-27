import AsyncStorage from '@react-native-async-storage/async-storage';

import { toAuthUser, AuthUser } from '../adapters/authAdapter';
import { API_PATHS } from '../backend';
import { USE_MOCK } from '../config';
import { mockAuthApi } from '../mocks/api/mockAuthApi';
import { api, tokenStorage, unwrap, STORAGE_KEYS } from '../api';
import { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../types';

export const authService = {
  login: async (credentials: LoginRequestDTO): Promise<AuthUser> => {
    let dto: AuthResponseDTO;

    if (USE_MOCK) {
      dto = unwrap(await mockAuthApi.login(credentials));
    } else {
      const response = await api.post<{ data: AuthResponseDTO }>(API_PATHS.auth.login, credentials);
      dto = unwrap(response);
    }

    const user = toAuthUser(dto);

    await tokenStorage.setTokens(dto.accessToken, dto.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  },

  register: async (data: RegisterRequestDTO): Promise<{ message: string }> => {
    if (USE_MOCK) {
      const mockResponse = await mockAuthApi.register(data);
      return mockResponse.data;
    }

    const response = await api.post(API_PATHS.auth.register, data);
    return { message: response.data.message ?? 'Dang ky thanh cong. Vui long kiem tra email.' };
  },

  logout: async (): Promise<void> => {
    try {
      if (USE_MOCK) {
        await mockAuthApi.logout();
      } else {
        const refreshToken = await tokenStorage.getRefresh();
        if (refreshToken) {
          await api.post(API_PATHS.auth.logout, { refreshToken });
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

    const response = await api.post<{ data: AuthResponseDTO }>(API_PATHS.auth.refresh, {
      refreshToken,
    });
    return unwrap(response);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post(API_PATHS.auth.forgotPassword, { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post(API_PATHS.auth.resetPassword, { token, newPassword });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post(API_PATHS.auth.verifyEmail, { token });
  },

  resendVerification: async (email: string): Promise<void> => {
    await api.post(API_PATHS.auth.resendVerification, { email });
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
