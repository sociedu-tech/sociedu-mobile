import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockMentorApi } from '@/src/core/mocks/api/mockUserMentorApi';
import {
  MentorPackage,
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  User,
} from '@/src/core/types';
import { userService } from '@/src/core/services/userService';

import { toMentorList, toMentorPackage, toMentorUser } from '../adapters/mentorAdapter';

const BASE = '/api/v1/mentors';

export interface MentorCurriculumInput {
  title: string;
  description?: string;
  orderIndex: number;
  duration?: number;
}

export interface MentorServiceFormInput {
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  versions: {
    id?: string;
    price: number;
    duration: number;
    deliveryType?: string;
    isDefault?: boolean;
    curriculums: MentorCurriculumInput[];
  }[];
}

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

  getPackageDetail: async (
    packageId: string | number,
    mentorId?: string | number
  ): Promise<MentorPackage> => {
    const normalizedId = String(packageId);

    let dto: ServicePackageResponseDTO | undefined;

    if (mentorId) {
      const packages = await mentorService.getPackages(mentorId);
      dto = packages.find((item) => String(item.id) === normalizedId);
    } else if (USE_MOCK) {
      const packages = unwrap(await mockMentorApi.getPackageDetail(packageId));
      dto = packages.find((item) => String(item.id) === normalizedId);
    } else {
      const res = await api.get<{ data: ServicePackageResponseDTO }>(`${BASE}/packages/${packageId}`);
      dto = unwrap(res);
    }

    if (!dto) {
      throw new Error('Khong tim thay goi dich vu.');
    }

    return toMentorPackage(dto);
  },

  getMyServices: async (): Promise<MentorPackage[]> => {
    const res = USE_MOCK
      ? await mockMentorApi.getMyServices()
      : await api.get<{ data: ServicePackageResponseDTO[] }>(`${BASE}/me/packages`);

    return unwrap(res).map(toMentorPackage);
  },

  getMyServiceById: async (packageId: string | number): Promise<MentorPackage> => {
    const services = await mentorService.getMyServices();
    const found = services.find((item) => item.id === String(packageId));

    if (!found) {
      throw new Error('Khong tim thay goi dich vu cua mentor.');
    }

    return found;
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

  saveService: async (data: MentorServiceFormInput): Promise<MentorPackage> => {
    const payload = {
      name: data.name,
      description: data.description ?? '',
      isActive: data.isActive ?? true,
      versions: data.versions.map((version) => ({
        id: version.id ? Number(version.id) : undefined,
        price: version.price,
        duration: version.duration,
        deliveryType: version.deliveryType ?? 'ONLINE',
        isDefault: version.isDefault ?? true,
        curriculums: version.curriculums.map((curriculum, index) => ({
          title: curriculum.title,
          description: curriculum.description ?? '',
          orderIndex: curriculum.orderIndex ?? index + 1,
          duration: curriculum.duration ?? 0,
        })),
      })),
    };

    const res = USE_MOCK
      ? await mockMentorApi.saveService(data)
      : data.id
        ? await api.put<{ data: ServicePackageResponseDTO }>(
            `${BASE}/me/packages/${data.id}`,
            payload
          )
        : await api.post<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages`, payload);

    return toMentorPackage(unwrap(res));
  },

  toggleServiceStatus: async (
    packageId: string | number,
    isActive: boolean
  ): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.toggleServiceStatus(packageId, isActive)
      : await api.patch<{ data: ServicePackageResponseDTO }>(
          `${BASE}/me/packages/${packageId}/status`,
          { isActive }
        );

    return toMentorPackage(unwrap(res));
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
