import { api } from '../api';
import { User } from '../types';

const BASE_URL = '/api/v1/users';

// ─── MOCK DATA (Dùng khi chưa có server) ─────────────────────
const MOCK_CURRENT_USER: User = {
  id: 'u1',
  name: 'Nguyễn Văn A',
  email: 'name@university.edu.vn',
  avatar: 'https://i.pravatar.cc/300?img=11',
  role: 'buyer',
  bio: 'Sinh viên năm 3 chuyên ngành Khoa học Máy tính. Đam mê lập trình web và mobile.',
  university: 'Đại học Bách Khoa Hà Nội',
  major: 'Khoa học Máy tính',
  year: 3,
  gpa: 3.8,
  joinedDate: '2023-09-01T00:00:00Z',
  socialLinks: {
    github: 'github.com/nguyenvana',
    linkedin: 'linkedin.com/in/nguyenvana',
  },
};

const MOCK_MENTOR_USER: User = {
  id: 'm1',
  name: 'Trần Thị B',
  email: 'tran.b@company.com',
  avatar: 'https://i.pravatar.cc/300?img=5',
  role: 'mentor',
  bio: 'Senior Software Engineer tại Google. Hơn 5 năm kinh nghiệm về React và Node.js.',
  rating: 4.9,
  joinedDate: '2021-08-15T00:00:00Z',
  mentorInfo: {
    headline: 'Senior Software Engineer tại Google',
    expertise: ['React', 'Node.js', 'System Design'],
    price: 500000,
    rating: 4.9,
    sessionsCompleted: 120,
    verificationStatus: 'verified'
  }
};

export const userService = {
  /**
   * Lấy profile của người dùng hiện tại
   */
  getMe: async (): Promise<User> => {
    try {
      const res = await api.get(`${BASE_URL}/me/profile`);
      return res.data;
    } catch (error) {
      console.warn('⚠️ Server không phản hồi, dùng MOCK_CURRENT_USER');
      // Giả lập delay mạng
      await new Promise(r => setTimeout(r, 600));
      return MOCK_CURRENT_USER;
    }
  },

  /**
   * Lấy profile của bất kỳ user/mentor nào theo ID
   */
  getProfile: async (id: string | number): Promise<User> => {
    try {
      const res = await api.get(`${BASE_URL}/${id}/profile`);
      return res.data;
    } catch (error) {
      console.warn(`⚠️ Server không phản hồi, dùng MOCK_MENTOR_USER cho id ${id}`);
      await new Promise(r => setTimeout(r, 600));
      return MOCK_MENTOR_USER;
    }
  },

  /**
   * Cập nhật thông tin profile của user
   */
  updateProfile: async (id: string | number, profileData: Partial<User>) => {
    try {
      const res = await api.put(`${BASE_URL}/me/profile`, profileData);
      return res.data;
    } catch (error) {
      console.warn('⚠️ API Edit lỗi, giả lập cập nhật thành công (Mock)');
      await new Promise(r => setTimeout(r, 1000));
      return { ...MOCK_CURRENT_USER, ...profileData };
    }
  },

  /**
   * Upload avatar cho user
   */
  uploadAvatar: async (fileData: FormData) => {
    try {
      const res = await api.post(`${BASE_URL}/me/avatar`, fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (error) {
      console.warn('⚠️ API Upload lỗi, giả lập upload thành công (Mock)');
      await new Promise(r => setTimeout(r, 1500));
      return { avatarUrl: 'https://i.pravatar.cc/300?img=33' };
    }
  },    

  // ── Các hàm phụ trợ khác (Experince, Education...) có thể thêm giống trên web 
  // khi làm chi tiết form EditProfile
};
