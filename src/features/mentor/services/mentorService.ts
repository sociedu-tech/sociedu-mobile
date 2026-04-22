import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockMentorApi } from '@/src/core/mocks/api/mockUserMentorApi';
import {
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  User,
} from '@/src/core/types';
import { userService } from '@/src/core/services/userService';

import { toMentorList, toMentorUser } from '../adapters/mentorAdapter';

const BASE = '/api/v1/mentors';

export const mentorService = {
  getAll: async (): Promise<User[]> => {
    const rawRes = USE_MOCK
      ? await mockMentorApi.getAll()
      : await api.get<{ data: MentorProfileResponseDTO[] }>(BASE);
    const mentors = toMentorList(unwrap(rawRes));

    const profiles = await Promise.allSettled(
      mentors.map((mentor) => userService.getPublicProfile(mentor.id))
    );

    return mentors.map((mentor, index) => {
      const profileResult = profiles[index];
      if (profileResult.status === 'fulfilled') {
        const profile = profileResult.value;
        return {
          ...mentor,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          bio: profile.bio,
        };
      }

      return mentor;
    });
  },

  getProfile: async (id: string | number): Promise<User> => {
    const rawRes = USE_MOCK
      ? await mockMentorApi.getProfile(id)
      : await api.get<{ data: MentorProfileResponseDTO }>(`${BASE}/${id}`);

    const mentor = toMentorUser(unwrap(rawRes));

    try {
      const profile = await userService.getPublicProfile(id);
      return {
        ...mentor,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        bio: profile.bio,
        educations: profile.educations,
        experiences: profile.experiences,
        certificates: profile.certificates,
      };
    } catch {
      return mentor;
    }
  },

  getPackages: async (id: string | number): Promise<ServicePackageResponseDTO[]> => {
    const res = USE_MOCK
      ? await mockMentorApi.getPackages(id)
      : await api.get<{ data: ServicePackageResponseDTO[] }>(`${BASE}/${id}/packages`);

    return unwrap(res);
  },

  updateMyProfile: async (data: {
    headline?: string;
    expertise?: string;
    basePrice?: number;
  }): Promise<User> => {
    const res = await api.put<{ data: MentorProfileResponseDTO }>(`${BASE}/me`, data);
    return toMentorUser(unwrap(res));
  },

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

  deletePackage: async (pkgId: string | number): Promise<void> => {
    await api.delete(`${BASE}/me/packages/${pkgId}`);
  },

  getCurriculum: async (pkgId: string | number, verId: string | number) => {
    const res = await api.get(`${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`);
    return unwrap(res);
  },

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
