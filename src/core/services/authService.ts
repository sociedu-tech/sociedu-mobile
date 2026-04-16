/**
 * authService.ts – Auth domain service
 *
 * Endpoints:
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/register
 *   POST /api/v1/auth/refresh
 *   POST /api/v1/auth/logout
 *   POST /api/v1/auth/forgot-password
 *   POST /api/v1/auth/reset-password
 *   POST /api/v1/auth/verify-email
 *   POST /api/v1/auth/resend-verification
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, tokenStorage, unwrap, STORAGE_KEYS } from '../api';
import { toAuthUser, AuthUser } from '../adapters/authAdapter';
import { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../types';
import { USE_MOCK } from '../config';
import { mockAuthApi } from '../mocks/api/mockAuthApi';

const BASE = '/api/v1/auth';

export const authService = {
  /**
   * Đăng nhập → lưu tokens + user → trả AuthUser
   */
  login: async (credentials: LoginRequestDTO): Promise<AuthUser> => {
    let dto: AuthResponseDTO;
    if (USE_MOCK) {
      dto = unwrap(await mockAuthApi.login(credentials));
    } else {
      const res = await api.post<{ data: AuthResponseDTO }>(`${BASE}/login`, credentials);
      dto = unwrap(res);
    }
    const user = toAuthUser(dto);

    // Lưu tokens + user vào AsyncStorage
    await tokenStorage.setTokens(dto.accessToken, dto.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  },

  /**
   * Đăng ký → backend gửi email xác minh → KHÔNG tự login
   */
  register: async (data: RegisterRequestDTO): Promise<{ message: string }> => {
    if (USE_MOCK) {
       const mockRes = await mockAuthApi.register(data);
       return mockRes.data;
    }
    const res = await api.post(`${BASE}/register`, data);
    return { message: res.data.message ?? 'Đăng ký thành công. Vui lòng kiểm tra email.' };
  },

  /**
   * Đăng xuất – gửi refreshToken để revoke, sau đó xoá storage
   */
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
    } catch {
      // Best effort – vẫn tiếp tục xoá local storage kể cả khi API lỗi
    } finally {
      await tokenStorage.clearAll();
    }
  },

  /**
   * Làm mới token (thường gọi tự động từ interceptor)
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponseDTO> => {
    if (USE_MOCK) {
       return unwrap(await mockAuthApi.refresh(refreshToken));
    }
    const res = await api.post<{ data: AuthResponseDTO }>(`${BASE}/refresh`, { refreshToken });
    return unwrap(res);
  },

  /**
   * Quên mật khẩu – gửi email reset link
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post(`${BASE}/forgot-password`, { email });
  },

  /**
   * Đặt lại mật khẩu bằng token từ email
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post(`${BASE}/reset-password`, { token, newPassword });
  },

  /**
   * Xác minh email bằng token từ link trong mail
   */
  verifyEmail: async (token: string): Promise<void> => {
    await api.post(`${BASE}/verify-email`, { token });
  },

  /**
   * Gửi lại email xác minh
   */
  resendVerification: async (email: string): Promise<void> => {
    await api.post(`${BASE}/resend-verification`, { email });
  },

  /**
   * Đọc user đã cache từ AsyncStorage (dùng khi hydrate)
   */
  getCachedUser: async (): Promise<AuthUser | null> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },
};
