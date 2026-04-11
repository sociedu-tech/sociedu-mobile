import { api, setAuthToken } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  userId: string;
  email: string;
  roles: string[];
  fullName: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const res = await api.post('/api/v1/auth/login', credentials);
      const data = res.data;
      if (data && data.accessToken) {
        await setAuthToken(data.accessToken);
        await AsyncStorage.setItem('user', JSON.stringify({
          id: data.userId,
          email: data.email,
          roles: data.roles,
          fullName: data.fullName,
        }));
      }
      return data;
    } catch (error) {
      console.warn('⚠️ Mạng lỗi hoặc chưa có server. Bật MOCK LOGIN mặc định.');
      // Giả lập server xử lý 600ms
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockData: LoginResponse = {
        accessToken: 'mock_jwt_token_unishare',
        userId: 'u1',
        email: credentials.email,
        roles: ['buyer'],
        fullName: 'Người dùng Test'
      };

      // Set auth storage y chang thật
      await setAuthToken(mockData.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify({
        id: mockData.userId,
        email: mockData.email,
        roles: mockData.roles,
        fullName: mockData.fullName,
      }));

      return mockData;
    }
  },

  register: async (userData: any) => {
    try {
      const res = await api.post('/api/v1/auth/register', userData);
      return res.data;
    } catch (error) {
      console.warn('⚠️ Mạng lỗi hoặc chưa có server. Bật MOCK REGISTER mặc định.');
      await new Promise(resolve => setTimeout(resolve, 600));
      return { success: true, message: 'Đăng ký mock thành công' };
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
  },

  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
