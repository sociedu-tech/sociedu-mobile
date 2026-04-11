/**
 * mentorService – tương đương sociedu-web/src/services/mentorService.ts
 * Dùng api instance đã có interceptor (token, error handling)
 */
import { api } from '../api';
import { User } from '../types';

const BASE_URL = '/api/v1/mentors';

export const mentorService = {
  /** Lấy danh sách tất cả mentor */
  getAll: async (): Promise<User[]> => {
    try {
      const res = await api.get(BASE_URL);
      return res.data || [];
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      return [];
    }
  },

  /** Lấy profile chi tiết của 1 mentor */
  getProfile: async (id: string | number): Promise<User | null> => {
    try {
      const res = await api.get(`${BASE_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch mentor ${id}:`, error);
      return null;
    }
  },

  /** Lấy danh sách gói dịch vụ của mentor */
  getPackages: async (id: string | number) => {
    try {
      const res = await api.get(`${BASE_URL}/${id}/packages`);
      return res.data || [];
    } catch (error) {
      console.error(`Failed to fetch packages for mentor ${id}:`, error);
      return [];
    }
  },
};
