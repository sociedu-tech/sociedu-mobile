import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockMentorApi } from '@/src/core/mocks/api/mockUserMentorApi';
import {
  AvailabilitySlot,
  MentorPackage,
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  User,
} from '@/src/core/types';
import { userService } from '@/src/features/profile/services/userService';

import { toMentorList, toMentorPackage, toMentorUser } from '../adapters/mentorAdapter';

const BASE = '/api/v1/mentors';

export interface MentorListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: {
    expertise?: string;
  };
  sort?: 'rating' | 'price' | 'sessions';
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

type MentorCardDTO = MentorProfileResponseDTO & {
  name?: string;
  email?: string;
  avatar?: string | null;
  bio?: string | null;
};

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
  getAll: async (query: MentorListQuery = {}): Promise<PaginatedResult<User>> => {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    if (USE_MOCK) {
      const rawRes = await mockMentorApi.getAll();
      let mentors = toMentorList(unwrap(rawRes));

      const profiles = await Promise.allSettled(
        mentors.map((mentor) => userService.getPublicProfile(mentor.id))
      );

      mentors = mentors.map((mentor, index) => {
        const profileResult = profiles[index];
        if (profileResult.status !== 'fulfilled') {
          return mentor;
        }

        const profile = profileResult.value;
        return {
          ...mentor,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          bio: profile.bio,
        };
      });

      const normalizedSearch = query.search?.trim().toLowerCase();
      const normalizedExpertise = query.filters?.expertise?.trim().toLowerCase();

      mentors = mentors.filter((mentor) => {
        const matchesSearch =
          !normalizedSearch ||
          mentor.name.toLowerCase().includes(normalizedSearch) ||
          mentor.mentorInfo?.headline.toLowerCase().includes(normalizedSearch) ||
          mentor.mentorInfo?.expertise.some((item) =>
            item.toLowerCase().includes(normalizedSearch)
          );
        const matchesExpertise =
          !normalizedExpertise ||
          mentor.mentorInfo?.expertise.some((item) =>
            item.toLowerCase().includes(normalizedExpertise)
          );

        return matchesSearch && matchesExpertise;
      });

      const total = mentors.length;
      const start = (page - 1) * pageSize;
      return {
        items: mentors.slice(start, start + pageSize),
        page,
        pageSize,
        total,
        hasNextPage: start + pageSize < total,
      };
    }

    const res = await api.get<{
      data:
        | MentorCardDTO[]
        | {
            items: MentorCardDTO[];
            page: number;
            pageSize: number;
            total: number;
            hasNextPage?: boolean;
          };
    }>(BASE, {
      params: {
        page,
        pageSize,
        search: query.search,
        expertise: query.filters?.expertise,
        sort: query.sort,
      },
    });

    const payload = unwrap(res);
    const items = Array.isArray(payload) ? payload : payload.items;
    const total = Array.isArray(payload) ? items.length : payload.total;
    const responsePage = Array.isArray(payload) ? page : payload.page;
    const responsePageSize = Array.isArray(payload) ? pageSize : payload.pageSize;

    return {
      items: toMentorList(items).map((mentor, index) => {
        const dto = items[index];
        return {
          ...mentor,
          name: dto.name ?? mentor.name,
          email: dto.email ?? mentor.email,
          avatar: dto.avatar ?? mentor.avatar,
          bio: dto.bio ?? mentor.bio,
        };
      }),
      page: responsePage,
      pageSize: responsePageSize,
      total,
      hasNextPage: Array.isArray(payload)
        ? responsePage * responsePageSize < total
        : (payload.hasNextPage ?? responsePage * responsePageSize < total),
    };
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
      throw new Error('Không tìm thấy gói dịch vụ.');
    }

    return toMentorPackage(dto);
  },

  getAvailabilitySlots: async (
    mentorId: string | number,
    packageVersionId: string | number
  ): Promise<AvailabilitySlot[]> => {
    if (USE_MOCK) {
      const now = new Date();
      return Array.from({ length: 5 }, (_, index) => {
        const start = new Date(now);
        start.setDate(now.getDate() + index + 1);
        start.setHours(9 + index, 0, 0, 0);
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + 60);

        return {
          id: `slot-${mentorId}-${packageVersionId}-${index + 1}`,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          isAvailable: index !== 3,
        };
      });
    }

    const res = await api.get<{ data: AvailabilitySlot[] }>(
      `${BASE}/${mentorId}/packages/versions/${packageVersionId}/availability`
    );
    return unwrap(res);
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
      throw new Error('Không tìm thấy gói dịch vụ của mentor.');
    }

    return found;
  },

  updateMyProfile: async (data: {
    headline?: string;
    expertise?: string;
    basePrice?: number;
  }): Promise<User> => {
    const res = USE_MOCK
      ? await mockMentorApi.getProfile(1)
      : await api.put<{ data: MentorProfileResponseDTO }>(`${BASE}/me`, data);
    return toMentorUser(unwrap(res));
  },

  addPackage: async (data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    deliveryType?: string;
  }): Promise<ServicePackageResponseDTO> => {
    const res = USE_MOCK
      ? await mockMentorApi.saveService({
          name: data.name,
          description: data.description,
          versions: [
            {
              price: data.price,
              duration: data.duration,
              deliveryType: data.deliveryType,
              isDefault: true,
              curriculums: [],
            },
          ],
        })
      : await api.post<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages`, data);
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
    if (USE_MOCK) {
      await mockMentorApi.deletePackage(pkgId);
      return;
    }

    await api.delete(`${BASE}/me/packages/${pkgId}`);
  },

  getCurriculum: async (pkgId: string | number, verId: string | number) => {
    const res = USE_MOCK
      ? await mockMentorApi.getCurriculum(pkgId, verId)
      : await api.get(`${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`);
    return unwrap(res);
  },

  addCurriculumItem: async (
    pkgId: string | number,
    verId: string | number,
    data: { title: string; description?: string; orderIndex: number; duration?: number }
  ) => {
    const res = USE_MOCK
      ? await mockMentorApi.addCurriculumItem(pkgId, verId, data)
      : await api.post(
          `${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`,
          data
        );
    return unwrap(res);
  },
};
