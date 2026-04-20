import { AuthResponseDTO } from '../../types';

export const mockAuthData: AuthResponseDTO = {
  accessToken: "mock.jwt.access.token.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "mock.jwt.refresh.token.98a7b6c5d4...",
  tokenType: "Bearer",
  expiresIn: 86400,
  userId: "e34a621c-a90b-4bd2-bea4-23be5185ea93",
  email: "buyer@unishare.vn",
  firstName: "Nguyễn Văn",
  lastName: "Học Viên",
  roles: ["ROLE_BUYER"]
};

export const mockMentorAuthData: AuthResponseDTO = {
  accessToken: "mock.jwt.access.token.mentor.xyz...",
  refreshToken: "mock.jwt.refresh.token.mentor.uvw...",
  tokenType: "Bearer",
  expiresIn: 86400,
  userId: "7f4c0b22-83b6-455b-b9f0-d38c641fcf61",
  email: "mentor@unishare.vn",
  firstName: "Trần Anh",
  lastName: "Chuyên Gia",
  roles: ["ROLE_MENTOR"]
};
