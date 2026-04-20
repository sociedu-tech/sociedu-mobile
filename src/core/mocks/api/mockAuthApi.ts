import { delay, withApiResponse } from '../utils';
import { mockAuthData, mockMentorAuthData } from '../data/authData';
import { LoginRequestDTO, RegisterRequestDTO } from '../../types';

export const mockAuthApi = {
  login: async (credentials: LoginRequestDTO) => {
    await delay(1000);
    // Nếu nhập email mentor, trả về token của mentor. Ngược lại trả buyer.
    if (credentials.email.includes('mentor')) {
      return withApiResponse(mockMentorAuthData);
    }
    return withApiResponse(mockAuthData);
  },

  register: async (data: RegisterRequestDTO) => {
    await delay(1200);
    return { data: { message: "Đăng ký thành công (Mock). Vui lòng kiểm tra email." } };
  },

  refresh: async (refreshToken: string) => {
    await delay(800);
    // Sinh token giả
    return withApiResponse({
      ...mockAuthData,
      accessToken: "mock.jwt.access.token.refreshed." + Date.now(),
      refreshToken: "mock.jwt.refresh.token.refreshed." + Date.now(),
    });
  },

  logout: async () => {
    await delay(500);
    return { data: { message: "Đã xóa token." } };
  }
};
