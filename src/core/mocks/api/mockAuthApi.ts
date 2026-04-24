import { delay, withApiResponse } from '../utils';
import { mockAuthData, mockMentorAuthData } from '../data/authData';
import {
  CompleteResetPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  VerifyResetPasswordOtpRequestDTO,
} from '../../types';

export const mockAuthApi = {
  login: async (credentials: LoginRequestDTO) => {
    await delay(1000);

    if (credentials.email.includes('mentor')) {
      return withApiResponse(mockMentorAuthData);
    }

    return withApiResponse(mockAuthData);
  },

  register: async (_data: RegisterRequestDTO) => {
    await delay(1200);
    return { data: { message: 'Đăng ký thành công (Mock). Vui lòng kiểm tra email.' } };
  },

  forgotPassword: async (email: string) => {
    await delay(900);
    return {
      message: `Đã gửi mã OTP đặt lại mật khẩu đến ${email}. Dùng mã 123456 trong mock mode.`,
    };
  },

  verifyResetPasswordOtp: async (payload: VerifyResetPasswordOtpRequestDTO) => {
    await delay(900);

    if (payload.otp !== '123456') {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    return {
      resetToken: `mock-reset-token-${payload.email}`,
      expiresIn: 600,
    };
  },

  completeResetPassword: async (payload: CompleteResetPasswordRequestDTO) => {
    await delay(900);

    if (!payload.resetToken) {
      throw new Error('Phiên đặt lại mật khẩu không hợp lệ.');
    }

    return {
      message: 'Đặt lại mật khẩu thành công (Mock).',
    };
  },

  refresh: async (_refreshToken: string) => {
    await delay(800);
    return withApiResponse({
      ...mockAuthData,
      accessToken: `mock.jwt.access.token.refreshed.${Date.now()}`,
      refreshToken: `mock.jwt.refresh.token.refreshed.${Date.now()}`,
    });
  },

  logout: async () => {
    await delay(500);
    return { data: { message: 'Đã xóa token.' } };
  },
};
