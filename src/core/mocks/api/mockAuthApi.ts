import { delay, withApiResponse } from '../utils';
import {
  mockAdminAuthData,
  mockApprovedMentorAuthData,
  mockAuthData,
  mockPendingMentorAuthData,
} from '../data/authData';
import {
  AuthResponseDTO,
  CompleteResetPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  VerifyResetPasswordOtpRequestDTO,
} from '../../types';

let currentAuthData: AuthResponseDTO = mockAuthData;

export const mockAuthApi = {
  login: async (credentials: LoginRequestDTO) => {
    await delay(1000);

    if (credentials.email.includes('admin')) {
      currentAuthData = mockAdminAuthData;
      return withApiResponse(currentAuthData);
    }

    if (credentials.email.includes('mentor.pending')) {
      currentAuthData = mockPendingMentorAuthData;
      return withApiResponse(currentAuthData);
    }

    if (credentials.email.includes('mentor')) {
      currentAuthData = mockApprovedMentorAuthData;
      return withApiResponse(currentAuthData);
    }

    currentAuthData = mockAuthData;
    return withApiResponse(currentAuthData);
  },

  register: async (_data: RegisterRequestDTO) => {
    await delay(1200);
    return { data: { message: 'Đăng ký thành công (Mock). Vui lòng kiểm tra email.' } };
  },

  forgotPassword: async (email: string) => {
    await delay(900);
    return {
      message: `Đã gửi liên kết đặt lại mật khẩu đến ${email}.`,
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

    if (!payload.token) {
      throw new Error('Phiên đặt lại mật khẩu không hợp lệ.');
    }

    return {
      message: 'Đặt lại mật khẩu thành công (Mock).',
    };
  },

  refresh: async (_refreshToken: string) => {
    await delay(800);
    return withApiResponse({
      ...currentAuthData,
      accessToken: `mock.jwt.access.token.refreshed.${Date.now()}`,
      refreshToken: `mock.jwt.refresh.token.refreshed.${Date.now()}`,
    });
  },

  logout: async () => {
    await delay(500);
    currentAuthData = mockAuthData;
    return { data: { message: 'Đã xóa token.' } };
  },

  verifyEmail: async (_token: string) => {
    await delay(900);
    return withApiResponse(currentAuthData);
  },

  resendVerification: async (_email: string) => {
    await delay(900);
    return { data: { message: 'Đã gửi lại email xác minh.' } };
  },
};
