import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:9999';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: tự động gắn token vào header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Không thể kết nối đến server.'));
  }
);

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem('token');
};
