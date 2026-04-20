/**
 * mentorService.ts – Mentor & Service Package domain
 *
 * Public endpoints (không cần auth):
 *   GET /api/v1/mentors                                  → danh sách mentor verified
 *   GET /api/v1/mentors/:id                              → chi tiết mentor
 *   GET /api/v1/mentors/:id/packages                     → gói dịch vụ của mentor
 *
 * Protected (ROLE_MENTOR):
 *   PUT /api/v1/mentors/me                               → cập nhật profile
 *   POST /api/v1/mentors/me/packages                     → tạo gói
 *   DELETE /api/v1/mentors/me/packages/:pkgId            → xóa gói
 *   GET/POST /api/v1/mentors/me/packages/:id/versions/:vid/curriculums
 */
import { api, unwrap } from '../api';
import {
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
} from '../types';
import { toMentorList, toMentorUser } from '../adapters/mentorAdapter';
import { User } from '../types';
import { userService } from './userService';
import { USE_MOCK } from '../config';
import { mockMentorApi } from '../mocks/api/mockUserMentorApi';

const BASE = '/api/v1/mentors';

export const mentorService = {
  /**
   * Danh sách tất cả mentor đã được verified (Public)
   */
  getAll: async (): Promise<User[]> => {
    const rawRes = USE_MOCK 
       ? await mockMentorApi.getAll()
       : await api.get<{ data: MentorProfileResponseDTO[] }>(BASE);
    const mentors = toMentorList(unwrap(rawRes));
    
    // N+1 để lấy tên và avatar
    const profiles = await Promise.allSettled(
      mentors.map((m) => userService.getPublicProfile(m.id))
    );

    return mentors.map((m, i) => {
      const pResult = profiles[i];
      if (pResult.status === 'fulfilled') {
        const p = pResult.value;
        return { ...m, name: p.name, email: p.email, avatar: p.avatar, bio: p.bio };
      }
      return m;
    });
  },

  /**
   * Chi tiết 1 mentor theo ID (Public)
   */
  getProfile: async (id: string | number): Promise<User> => {
    const rawRes = USE_MOCK
       ? await mockMentorApi.getProfile(id)
       : await api.get<{ data: MentorProfileResponseDTO }>(`${BASE}/${id}`);
       
    const mentor = toMentorUser(unwrap(rawRes));
    try {
      const p = await userService.getPublicProfile(id);
      return { ...mentor, name: p.name, email: p.email, avatar: p.avatar, bio: p.bio, educations: p.educations, experiences: p.experiences, certificates: p.certificates };
    } catch {
      return mentor;
    }
  },

  /**
   * Danh sách gói dịch vụ của mentor (Public)
   */
  getPackages: async (id: string | number): Promise<ServicePackageResponseDTO[]> => {
    const res = USE_MOCK 
      ? await mockMentorApi.getPackages(id)
      : await api.get<{ data: ServicePackageResponseDTO[] }>(`${BASE}/${id}/packages`);
    return unwrap(res);
  },

  /**
   * Cập nhật profile mentor của mình (ROLE_MENTOR)
   */
  updateMyProfile: async (data: {
    headline?: string;
    expertise?: string;       // comma-separated
    basePrice?: number;
  }): Promise<User> => {
    const res = await api.put<{ data: MentorProfileResponseDTO }>(`${BASE}/me`, data);
    return toMentorUser(unwrap(res));
  },

  /**
   * Tạo gói dịch vụ mới (ROLE_MENTOR)
   */
  addPackage: async (data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    deliveryType?: string;
  }): Promise<ServicePackageResponseDTO> => {
    const res = await api.post<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages`, data);
    return unwrap(res);
  },

  /**
   * Xóa gói dịch vụ (ROLE_MENTOR)
   */
  deletePackage: async (pkgId: string | number): Promise<void> => {
    await api.delete(`${BASE}/me/packages/${pkgId}`);
  },

  /**
   * Lấy danh sách curriculum của 1 package version (ROLE_MENTOR)
   */
  getCurriculum: async (pkgId: string | number, verId: string | number) => {
    const res = await api.get(`${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`);
    return unwrap(res);
  },

  /**
   * Thêm curriculum item (ROLE_MENTOR)
   */
  addCurriculumItem: async (
    pkgId: string | number,
    verId: string | number,
    data: { title: string; description?: string; orderIndex: number; duration?: number }
  ) => {
    const res = await api.post(
      `${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`,
      data
    );
    return unwrap(res);
  },
};
