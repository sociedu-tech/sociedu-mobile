import { AuthResponseDTO } from '../../types';

export const mockAuthData: AuthResponseDTO = {
  accessToken: 'mock.jwt.access.token.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'mock.jwt.refresh.token.98a7b6c5d4...',
  tokenType: 'Bearer',
  expiresIn: 86400,
  userId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
  email: 'buyer@unishare.vn',
  firstName: 'Nguyễn Văn',
  lastName: 'Học Viên',
  roles: ['ROLE_USER'],
};

export const mockApprovedMentorAuthData: AuthResponseDTO = {
  accessToken: 'mock.jwt.access.token.mentor.approved...',
  refreshToken: 'mock.jwt.refresh.token.mentor.approved...',
  tokenType: 'Bearer',
  expiresIn: 86400,
  userId: '7f4c0b22-83b6-455b-b9f0-d38c641fcf61',
  email: 'mentor@unishare.vn',
  firstName: 'Trần Anh',
  lastName: 'Chuyên Gia',
  roles: ['ROLE_USER', 'ROLE_MENTOR'],
  mentorVerificationStatus: 'VERIFIED',
};

export const mockPendingMentorAuthData: AuthResponseDTO = {
  accessToken: 'mock.jwt.access.token.mentor.pending...',
  refreshToken: 'mock.jwt.refresh.token.mentor.pending...',
  tokenType: 'Bearer',
  expiresIn: 86400,
  userId: '962b8d5e-98e0-46d0-8d96-9208f5714512',
  email: 'mentor.pending@unishare.vn',
  firstName: 'Lê Minh',
  lastName: 'Chờ Duyệt',
  roles: ['ROLE_USER', 'ROLE_MENTOR'],
  mentorVerificationStatus: 'PENDING',
};

export const mockAdminAuthData: AuthResponseDTO = {
  accessToken: 'mock.jwt.access.token.admin...',
  refreshToken: 'mock.jwt.refresh.token.admin...',
  tokenType: 'Bearer',
  expiresIn: 86400,
  userId: 'cbfa2f2b-58f9-4cb7-8c46-12e1d8180f6c',
  email: 'admin@unishare.vn',
  firstName: 'Phạm',
  lastName: 'Quản Trị',
  roles: ['ROLE_USER', 'ROLE_ADMIN'],
};
