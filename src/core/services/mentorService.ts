import { api, unwrap } from '../api';
import {
  CreateServiceRequest,
  CurriculumItemResponseDTO,
  CreatePackageVersionRequest,
  MentorPackage,
  MentorPackageVersion,
  MentorProfileResponseDTO,
  PageResponseDTO,
  ServicePackageResponseDTO,
  ServicePackageVersionResponseDTO,
  UpdateMentorProfileRequest,
  UpdateServiceRequest,
  User,
} from '../types';
import { toMentorList, toMentorUser, toPackage, toPackageVersion } from '../adapters/mentorAdapter';
import { userService } from './userService';
import { USE_MOCK } from '../config';
import { mockMentorApi } from '../mocks/api/mockUserMentorApi';

const MENTOR_BASE = '/api/v1/mentors';
const SERVICE_PACKAGE_BASE = '/api/v1/service-packages';

function getPageContent<T>(payload: T[] | PageResponseDTO<T> | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.content) ? payload.content : [];
}

function findPackageVersion(
  payload: ServicePackageResponseDTO | ServicePackageVersionResponseDTO,
  versionId: string | number,
): MentorPackageVersion {
  if ('versions' in payload) {
    const pkg = toPackage(payload);
    const version = pkg.versions.find((item) => String(item.id) === String(versionId));
    if (!version) {
      throw new Error('Khong tim thay phien ban goi dich vu.');
    }
    return version;
  }

  return toPackageVersion(payload);
}

export const mentorService = {
  getMyProfile: async (): Promise<User> => {
    const rawRes = USE_MOCK
      ? await mockMentorApi.getProfile('me')
      : await api.get<{ data: MentorProfileResponseDTO }>(`${MENTOR_BASE}/me/profile`);

    return toMentorUser(unwrap(rawRes));
  },

  getAll: async (): Promise<User[]> => {
    const mentorDtos = USE_MOCK
      ? unwrap(await mockMentorApi.getAll())
      : getPageContent(
          unwrap(await api.get<{ data: PageResponseDTO<MentorProfileResponseDTO> }>(MENTOR_BASE)),
        );
    const mentors = toMentorList(mentorDtos);

    const profiles = await Promise.allSettled(
      mentors.map((mentor) => userService.getPublicProfile(mentor.id)),
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
      : await api.get<{ data: MentorProfileResponseDTO }>(`${MENTOR_BASE}/${id}`);

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
    if (USE_MOCK) {
      return unwrap(await mockMentorApi.getPackages(id));
    }

    const res = await api.get<{ data: PageResponseDTO<ServicePackageResponseDTO> }>(
      `${MENTOR_BASE}/${id}/packages`,
    );
    return getPageContent(unwrap(res));
  },

  getMyPackageById: async (pkgId: string | number): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.getMyPackageById(pkgId)
      : await api.get<{ data: ServicePackageResponseDTO }>(`${MENTOR_BASE}/me/packages/${pkgId}`);
    return toPackage(unwrap(res));
  },

  getPackageById: async (pkgId: string | number): Promise<MentorPackage> => {
    return mentorService.getMyPackageById(pkgId);
  },

  createPackage: async (data: CreateServiceRequest): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.createPackage(data)
      : await api.post<{ data: ServicePackageResponseDTO }>(`${MENTOR_BASE}/me/packages`, {
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          deliveryType: data.deliveryType,
          curriculums: data.versions[0]?.curriculums ?? [],
        });
    return toPackage(unwrap(res));
  },

  updatePackage: async (
    pkgId: string | number,
    data: UpdateServiceRequest,
  ): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.updatePackage(pkgId, { ...data, isActive: true })
      : await api.put<{ data: ServicePackageResponseDTO }>(`${SERVICE_PACKAGE_BASE}/${pkgId}`, data);
    return toPackage(unwrap(res));
  },

  updateService: async (
    pkgId: string | number,
    data: UpdateServiceRequest,
  ): Promise<MentorPackage> => {
    return mentorService.updatePackage(pkgId, data);
  },

  getPackageVersions: async (pkgId: string | number): Promise<MentorPackageVersion[]> => {
    if (USE_MOCK) {
      const pkg = await mentorService.getMyPackageById(pkgId);
      return pkg.versions;
    }

    const res = await api.get<{ data: PageResponseDTO<ServicePackageVersionResponseDTO> }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/versions`,
    );
    return getPageContent(unwrap(res)).map(toPackageVersion);
  },

  getPackageVersionById: async (
    pkgId: string | number,
    versionId: string | number,
  ): Promise<MentorPackageVersion> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.getPackageVersionById(pkgId, versionId);
      return findPackageVersion(unwrap(res), versionId);
    }
    const res = await api.get<{ data: ServicePackageVersionResponseDTO }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/versions/${versionId}`,
    );
    return findPackageVersion(unwrap(res), versionId);
  },

  createPackageVersion: async (
    pkgId: string | number,
    data: CreatePackageVersionRequest,
  ): Promise<MentorPackageVersion> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.createPackageVersion(pkgId, data);
      return findPackageVersion(unwrap(res), 'new');
    }

    const versionPayload = {
      price: data.price,
      duration: data.duration,
      deliveryType: data.deliveryType,
    };
    const res = await api.post<{ data: ServicePackageResponseDTO }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/versions`,
      versionPayload,
    );
    const createdVersion = toPackage(unwrap(res)).versions.find((item) => item.isDefault);
    if (!createdVersion) {
      throw new Error('Khong tim thay phien ban vua tao.');
    }

    if (data.curriculums.length > 0) {
      await Promise.all(
        data.curriculums.map((item) =>
          mentorService.addCurriculumItem(pkgId, createdVersion.id, {
            title: item.title,
            description: item.description,
            orderIndex: item.orderIndex,
            duration: item.duration,
          }),
        ),
      );
    }

    return mentorService.getPackageVersionById(pkgId, createdVersion.id);
  },

  updatePackageVersion: async (
    pkgId: string | number,
    versionId: string | number,
    data: CreatePackageVersionRequest,
  ): Promise<MentorPackageVersion> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.updatePackageVersion(pkgId, versionId, data);
      return findPackageVersion(unwrap(res), versionId);
    }

    return mentorService.getPackageVersionById(pkgId, versionId);
  },

  deletePackageVersion: async (pkgId: string | number, versionId: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockMentorApi.deletePackageVersion(pkgId, versionId);
    }
  },

  setDefaultPackageVersion: async (
    pkgId: string | number,
    versionId: string | number,
  ): Promise<MentorPackageVersion | null> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.setDefaultPackageVersion(pkgId, versionId);
      const dto = unwrap(res);
      if (!dto) return null;
      return findPackageVersion(dto, versionId);
    }

    return null;
  },

  updateMyProfile: async (data: UpdateMentorProfileRequest): Promise<User> => {
    const res = await api.put<{ data: MentorProfileResponseDTO }>(`${MENTOR_BASE}/me`, data);
    return toMentorUser(unwrap(res));
  },

  submitMyProfile: async (): Promise<User> => {
    const res = await api.post<{ data: MentorProfileResponseDTO }>(`${MENTOR_BASE}/me/profile/submit`);
    return toMentorUser(unwrap(res));
  },

  addPackage: async (data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    deliveryType?: string;
  }): Promise<ServicePackageResponseDTO> => {
    const res = await api.post<{ data: ServicePackageResponseDTO }>(`${MENTOR_BASE}/me/packages`, data);
    return unwrap(res);
  },

  deletePackage: async (pkgId: string | number): Promise<void> => {
    await api.delete(`${MENTOR_BASE}/me/packages/${pkgId}`);
  },

  getCurriculum: async (pkgId: string | number, verId: string | number): Promise<CurriculumItemResponseDTO[]> => {
    if (USE_MOCK) {
      const version = await mentorService.getPackageVersionById(pkgId, verId);
      return version.curriculums.map((item) => ({
        id: Number(item.id),
        packageVersionId: Number(verId),
        title: item.title,
        description: item.description,
        orderIndex: item.orderIndex,
        duration: item.duration,
      }));
    }

    const res = await api.get<{ data: PageResponseDTO<CurriculumItemResponseDTO> }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/versions/${verId}/curriculums`,
    );
    return getPageContent(unwrap(res));
  },

  addCurriculumItem: async (
    pkgId: string | number,
    verId: string | number,
    data: { title: string; description?: string; orderIndex: number; duration?: number },
  ) => {
    if (USE_MOCK) {
      const res = await mockMentorApi.addCurriculumItem?.(pkgId, verId, data);
      if (res) return unwrap(res);
    }

    const res = await api.post<{ data: CurriculumItemResponseDTO }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/versions/${verId}/curriculums`,
      data,
    );
    return unwrap(res);
  },

  updateCurriculumItem: async (
    pkgId: string | number,
    verId: string | number,
    curriculumId: string | number,
    data: { title: string; description?: string; orderIndex: number; duration?: number },
  ) => {
    if (USE_MOCK) {
      const res = await mockMentorApi.updateCurriculumItem?.(pkgId, verId, curriculumId, data);
      if (res) return unwrap(res);
    }

    const res = await api.put<{ data: CurriculumItemResponseDTO }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/versions/${verId}/curriculums/${curriculumId}`,
      data,
    );
    return unwrap(res);
  },

  deleteCurriculumItem: async (
    pkgId: string | number,
    verId: string | number,
    curriculumId: string | number,
  ): Promise<void> => {
    if (USE_MOCK) {
      await mockMentorApi.deleteCurriculumItem?.(pkgId, verId, curriculumId);
      return;
    }

    await api.delete(`${SERVICE_PACKAGE_BASE}/${pkgId}/versions/${verId}/curriculums/${curriculumId}`);
  },

  getMyServices: async (): Promise<MentorPackage[]> => {
    if (USE_MOCK) {
      return unwrap(await mockMentorApi.getMyServices()).map(toPackage);
    }

    const res = await api.get<{ data: PageResponseDTO<ServicePackageResponseDTO> }>(
      `${MENTOR_BASE}/me/packages`,
    );
    return getPageContent(unwrap(res)).map(toPackage);
  },

  toggleServiceStatus: async (pkgId: string): Promise<MentorPackage> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.toggleServiceStatus(pkgId);
      const dto = unwrap(res);
      if (!dto) {
        throw new Error('Khong tim thay goi dich vu.');
      }
      return toPackage(dto);
    }

    const res = await api.patch<{ data: ServicePackageResponseDTO }>(
      `${SERVICE_PACKAGE_BASE}/${pkgId}/toggle`,
    );
    return toPackage(unwrap(res));
  },
};
