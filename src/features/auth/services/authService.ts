import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, STORAGE_KEYS, tokenStorage, unwrap } from '@/src/core/api';
import { API_PATHS } from '@/src/core/backend';
import { USE_MOCK } from '@/src/core/config';
import { mockAuthApi } from '@/src/core/mocks/api/mockAuthApi';
import {
  AuthResponseDTO,
  CompleteResetPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  VerifyResetPasswordOtpRequestDTO,
  VerifyResetPasswordOtpResponseDTO,
} from '@/src/core/types';

import { AuthUser, hydrateAuthUser, toAuthUser } from '../adapters/authAdapter';

export const authService = {
  login: async (credentials: LoginRequestDTO): Promise<AuthUser> => {
    let dto: AuthResponseDTO;

    if (USE_MOCK) {
      dto = unwrap(await mockAuthApi.login(credentials));
    } else {
      const res = await api.post<{ data: AuthResponseDTO }>(API_PATHS.auth.login, credentials);
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

    const res = await api.post(API_PATHS.auth.register, data);
    return {
      message: res.data.message ?? 'Đăng ký thành công. Vui lòng kiểm tra email.',
    };
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

    const res = await api.post<{ data: AuthResponseDTO }>(API_PATHS.auth.refresh, { refreshToken });
    return unwrap(res);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return mockAuthApi.forgotPassword(email);
    }

    const res = await api.post(API_PATHS.auth.forgotPassword, { email });
    return {
      message: res.data.message ?? 'Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra email.',
    };
  },

  verifyResetPasswordOtp: async (
    payload: VerifyResetPasswordOtpRequestDTO
  ): Promise<VerifyResetPasswordOtpResponseDTO> => {
    if (USE_MOCK) {
      return mockAuthApi.verifyResetPasswordOtp(payload);
    }

    throw new Error('Backend hiện tại dùng liên kết đặt lại mật khẩu, không hỗ trợ xác thực OTP.');
  },

  completeResetPassword: async (
    payload: CompleteResetPasswordRequestDTO
  ): Promise<{ message: string }> => {
    if (USE_MOCK) {
      return mockAuthApi.completeResetPassword(payload);
    }

    const res = await api.post(API_PATHS.auth.resetPassword, payload);
    return { message: res.data.message ?? 'Đặt lại mật khẩu thành công.' };
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await authService.completeResetPassword({ token, newPassword });
  },

  verifyEmail: async (token: string): Promise<void> => {
    if (USE_MOCK) {
      await mockAuthApi.verifyEmail(token);
      return;
    }

    await api.post(API_PATHS.auth.verifyEmail, { token });
  },

  resendVerification: async (email: string): Promise<void> => {
    if (USE_MOCK) {
      await mockAuthApi.resendVerification(email);
      return;
    }

    await api.post(API_PATHS.auth.resendVerification, { email });
  },

  getCachedUser: async (): Promise<AuthUser | null> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return raw ? hydrateAuthUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
};
