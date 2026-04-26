import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { mockMentorApi } from '@/src/core/mocks/api/mockUserMentorApi';
import {
  AvailabilitySlot,
  CurriculumItemResponseDTO,
  MentorPackage,
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  User,
} from '@/src/core/types';
import { userService } from '@/src/features/profile/services/userService';

import { toMentorList, toMentorPackage, toMentorUser } from '../adapters/mentorAdapter';

const BASE = '/api/v1/mentors';
const PACKAGE_BASE = '/api/v1/service-packages';

interface SpringPage<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}

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

function normalizeSpringPage<T>(payload: T[] | SpringPage<T>, fallbackPage: number, fallbackPageSize: number) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: fallbackPage,
      pageSize: fallbackPageSize,
      total: payload.length,
      hasNextPage: fallbackPage * fallbackPageSize < payload.length,
    };
  }

  return {
    items: payload.content ?? [],
    page: (payload.number ?? 0) + 1,
    pageSize: payload.size ?? fallbackPageSize,
    total: payload.totalElements ?? 0,
    hasNextPage: !(payload.last ?? true),
  };
}

function buildCreatePayload(data: MentorServiceFormInput) {
  const version = data.versions[0];
  if (!version) {
    throw new Error('Goi dich vu can it nhat mot phien ban.');
  }

  return {
    name: data.name,
    description: data.description ?? '',
    price: version.price,
    duration: version.duration,
    deliveryType: version.deliveryType ?? 'ONLINE',
    curriculums: version.curriculums.map((curriculum, index) => ({
      title: curriculum.title,
      description: curriculum.description ?? '',
      orderIndex: curriculum.orderIndex ?? index + 1,
      duration: curriculum.duration ?? 1,
    })),
  };
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
      data: MentorCardDTO[] | SpringPage<MentorCardDTO>;
    }>(BASE, {
      params: {
        page: Math.max(page - 1, 0),
        size: pageSize,
      },
    });

    const normalized = normalizeSpringPage(unwrap(res), page, pageSize);
    const items = normalized.items;

    return {
      items: toMentorList(items).map((mentor, index) => {
        const dto = items[index];
        return {
          ...mentor,
          name: dto.name ?? dto.displayName ?? mentor.name,
          email: dto.email ?? mentor.email,
          avatar: dto.avatar ?? mentor.avatar,
          bio: dto.bio ?? mentor.bio,
        };
      }),
      page: normalized.page,
      pageSize: normalized.pageSize,
      total: normalized.total,
      hasNextPage: normalized.hasNextPage,
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
        name: profile.name || mentor.name,
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
    if (USE_MOCK) {
      return unwrap(await mockMentorApi.getPackages(id));
    }

    return normalizeSpringPage(
      unwrap(
        await api.get<{ data: SpringPage<ServicePackageResponseDTO> }>(`${BASE}/${id}/packages`, {
          params: { page: 0, size: 20 },
        })
      ),
      1,
      20
    ).items;
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
      const res = await api.get<{ data: ServicePackageResponseDTO }>(`${PACKAGE_BASE}/${packageId}`);
      dto = unwrap(res);
    }

    if (!dto) {
      throw new Error('Khong tim thay goi dich vu.');
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

    return [];
  },

  getMyServices: async (): Promise<MentorPackage[]> => {
    if (USE_MOCK) {
      return unwrap(await mockMentorApi.getMyServices()).map(toMentorPackage);
    }

    return normalizeSpringPage(
      unwrap(
        await api.get<{ data: SpringPage<ServicePackageResponseDTO> }>(`${BASE}/me/packages`, {
          params: { page: 0, size: 20 },
        })
      ),
      1,
      20
    ).items.map(toMentorPackage);
  },

  getMyServiceById: async (packageId: string | number): Promise<MentorPackage> => {
    if (USE_MOCK) {
      const services = await mentorService.getMyServices();
      const found = services.find((item) => item.id === String(packageId));

      if (!found) {
        throw new Error('Khong tim thay goi dich vu cua mentor.');
      }

      return found;
    }

    const res = await api.get<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages/${packageId}`);
    return toMentorPackage(unwrap(res));
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
    if (USE_MOCK) {
      return unwrap(
        await mockMentorApi.saveService({
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
      );
    }

    return unwrap(
      await api.post<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages`, {
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        duration: data.duration,
        deliveryType: data.deliveryType ?? 'ONLINE',
        curriculums: [
          {
            title: 'Session 1',
            description: '',
            orderIndex: 1,
            duration: data.duration,
          },
        ],
      })
    );
  },

  saveService: async (data: MentorServiceFormInput): Promise<MentorPackage> => {
    if (USE_MOCK) {
      return toMentorPackage(unwrap(await mockMentorApi.saveService(data)));
    }

    const primaryVersion = data.versions[0];
    if (!primaryVersion) {
      throw new Error('Goi dich vu can it nhat mot phien ban.');
    }

    if (!data.id) {
      const created = await api.post<{ data: ServicePackageResponseDTO }>(
        `${BASE}/me/packages`,
        buildCreatePayload(data)
      );
      return toMentorPackage(unwrap(created));
    }

    let packageDto = unwrap(
      await api.get<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages/${data.id}`)
    );

    const currentDefault =
      packageDto.versions.find((version) => version.isDefault) ?? packageDto.versions[0] ?? null;

    if (
      packageDto.name !== data.name ||
      (packageDto.description ?? '') !== (data.description ?? '')
    ) {
      packageDto = unwrap(
        await api.put<{ data: ServicePackageResponseDTO }>(`${PACKAGE_BASE}/${data.id}`, {
          name: data.name,
          description: data.description ?? '',
        })
      );
    }

    const needsNewVersion =
      !currentDefault ||
      Number(currentDefault.price) !== Number(primaryVersion.price) ||
      currentDefault.duration !== primaryVersion.duration ||
      (currentDefault.deliveryType ?? 'ONLINE') !== (primaryVersion.deliveryType ?? 'ONLINE');

    let activeVersion =
      packageDto.versions.find((version) => version.isDefault) ?? packageDto.versions[0] ?? null;

    if (needsNewVersion) {
      packageDto = unwrap(
        await api.post<{ data: ServicePackageResponseDTO }>(`${PACKAGE_BASE}/${data.id}/versions`, {
          price: primaryVersion.price,
          duration: primaryVersion.duration,
          deliveryType: primaryVersion.deliveryType ?? 'ONLINE',
        })
      );

      activeVersion =
        packageDto.versions.find((version) => version.isDefault) ?? packageDto.versions[0] ?? null;
    }

    if (!activeVersion) {
      throw new Error('Khong tim thay version mac dinh de dong bo curriculum.');
    }

    for (const curriculum of activeVersion.curriculums ?? []) {
      await api.delete(
        `${PACKAGE_BASE}/${data.id}/versions/${activeVersion.id}/curriculums/${curriculum.id}`
      );
    }

    for (const [index, curriculum] of primaryVersion.curriculums.entries()) {
      await api.post<{ data: CurriculumItemResponseDTO }>(
        `${PACKAGE_BASE}/${data.id}/versions/${activeVersion.id}/curriculums`,
        {
          title: curriculum.title,
          description: curriculum.description ?? '',
          orderIndex: curriculum.orderIndex ?? index + 1,
          duration: curriculum.duration ?? 1,
        }
      );
    }

    let finalPackage = unwrap(
      await api.get<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages/${data.id}`)
    );

    if ((data.isActive ?? true) !== (finalPackage.isActive ?? true)) {
      finalPackage = unwrap(
        await api.patch<{ data: ServicePackageResponseDTO }>(`${PACKAGE_BASE}/${data.id}/toggle`)
      );
    }

    return toMentorPackage(finalPackage);
  },

  toggleServiceStatus: async (
    packageId: string | number,
    isActive: boolean
  ): Promise<MentorPackage> => {
    if (USE_MOCK) {
      return toMentorPackage(unwrap(await mockMentorApi.toggleServiceStatus(packageId, isActive)));
    }

    return toMentorPackage(
      unwrap(await api.patch<{ data: ServicePackageResponseDTO }>(`${PACKAGE_BASE}/${packageId}/toggle`))
    );
  },

  deletePackage: async (pkgId: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockMentorApi.deletePackage(pkgId);
      return;
    }

    await api.delete(`${BASE}/me/packages/${pkgId}`);
  },

  getCurriculum: async (pkgId: string | number, verId: string | number) => {
    if (USE_MOCK) {
      return unwrap(await mockMentorApi.getCurriculum(pkgId, verId));
    }

    return normalizeSpringPage(
      unwrap(
        await api.get<{ data: SpringPage<CurriculumItemResponseDTO> }>(
          `${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`,
          { params: { page: 0, size: 50 } }
        )
      ),
      1,
      50
    ).items;
  },

  addCurriculumItem: async (
    pkgId: string | number,
    verId: string | number,
    data: { title: string; description?: string; orderIndex: number; duration?: number }
  ) => {
    const res = USE_MOCK
      ? await mockMentorApi.addCurriculumItem(pkgId, verId, data)
      : await api.post<{ data: CurriculumItemResponseDTO }>(
          `${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`,
          data
        );
    return unwrap(res);
  },
};
