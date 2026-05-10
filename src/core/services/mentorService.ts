import { api, unwrap } from '../api';
import {
  CreatePackageVersionRequest,
  MentorPackage,
  MentorPackageVersion,
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  UpdateMentorProfileRequest,
  UpdateServiceRequest,
  User,
} from '../types';
import { toMentorList, toMentorUser, toPackage } from '../adapters/mentorAdapter';
import { userService } from './userService';
import { USE_MOCK } from '../config';
import { mockMentorApi } from '../mocks/api/mockUserMentorApi';

const BASE = '/api/v1/mentors';

export const mentorService = {
  getMyProfile: async (): Promise<User> => {
    const rawRes = USE_MOCK
      ? await mockMentorApi.getProfile('me')
      : await api.get<{ data: MentorProfileResponseDTO }>(`${BASE}/me/profile`);

    return toMentorUser(unwrap(rawRes));
  },

  getAll: async (): Promise<User[]> => {
    const rawRes = USE_MOCK
      ? await mockMentorApi.getAll()
      : await api.get<{ data: MentorProfileResponseDTO[] }>(BASE);
    const mentors = toMentorList(unwrap(rawRes));

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
    mentorId: string | number,
  ): Promise<MentorPackage> => {
    const packages = await mentorService.getPackages(mentorId);
    const found = packages.find((item) => String(item.id) === String(packageId));

    if (!found) {
      throw new Error('Package not found.');
    }

    return toPackage(found);
  },

  getMyPackageById: async (pkgId: string | number): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.getMyPackageById(pkgId)
      : await api.get<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages/${pkgId}`);
    return toPackage(unwrap(res));
  },

  getPackageById: async (pkgId: string | number): Promise<MentorPackage> => {
    return mentorService.getMyPackageById(pkgId);
  },

  createPackage: async (data: UpdateServiceRequest): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.createPackage(data)
      : await api.post<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages`, data);
    return toPackage(unwrap(res));
  },

  updatePackage: async (
    pkgId: string | number,
    data: UpdateServiceRequest,
  ): Promise<MentorPackage> => {
    const res = USE_MOCK
      ? await mockMentorApi.updatePackage(pkgId, data)
      : await api.patch<{ data: ServicePackageResponseDTO }>(`${BASE}/me/packages/${pkgId}`, data);
    return toPackage(unwrap(res));
  },

  updateService: async (
    pkgId: string | number,
    data: UpdateServiceRequest,
  ): Promise<MentorPackage> => {
    return mentorService.updatePackage(pkgId, data);
  },

  getPackageVersions: async (pkgId: string | number): Promise<MentorPackageVersion[]> => {
    const pkg = await mentorService.getMyPackageById(pkgId);
    return pkg.versions;
  },

  getPackageVersionById: async (
    pkgId: string | number,
    versionId: string | number,
  ): Promise<MentorPackageVersion> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.getPackageVersionById(pkgId, versionId);
      const pkg = toPackage({
        id: Number(pkgId),
        mentorId: 0,
        name: '',
        description: '',
        isActive: true,
        versions: [unwrap(res)],
      });
      return pkg.versions[0];
    }
    const res = await api.get<{ data: ServicePackageResponseDTO }>(
      `${BASE}/me/packages/${pkgId}/versions/${versionId}`,
    );
    const pkg = toPackage(unwrap(res));
    return pkg.versions[0];
  },

  createPackageVersion: async (
    pkgId: string | number,
    data: CreatePackageVersionRequest,
  ): Promise<MentorPackageVersion> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.createPackageVersion(pkgId, data);
      const pkg = toPackage({
        id: Number(pkgId),
        mentorId: 0,
        name: '',
        description: '',
        isActive: true,
        versions: [unwrap(res)],
      });
      return pkg.versions[0];
    }

    const res = await api.post<{ data: ServicePackageResponseDTO }>(
      `${BASE}/me/packages/${pkgId}/versions`,
      data,
    );
    const pkg = toPackage(unwrap(res));
    return pkg.versions[0];
  },

  updatePackageVersion: async (
    pkgId: string | number,
    versionId: string | number,
    data: CreatePackageVersionRequest,
  ): Promise<MentorPackageVersion> => {
    if (USE_MOCK) {
      const res = await mockMentorApi.updatePackageVersion(pkgId, versionId, data);
      const pkg = toPackage({
        id: Number(pkgId),
        mentorId: 0,
        name: '',
        description: '',
        isActive: true,
        versions: [unwrap(res)],
      });
      return pkg.versions[0];
    }

    const res = await api.patch<{ data: ServicePackageResponseDTO }>(
      `${BASE}/me/packages/${pkgId}/versions/${versionId}`,
      data,
    );
    const pkg = toPackage(unwrap(res));
    return pkg.versions[0];
  },

  deletePackageVersion: async (pkgId: string | number, versionId: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockMentorApi.deletePackageVersion(pkgId, versionId);
    } else {
      await api.delete(`${BASE}/me/packages/${pkgId}/versions/${versionId}`);
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
      const pkg = toPackage({
        id: Number(pkgId),
        mentorId: 0,
        name: '',
        description: '',
        isActive: true,
        versions: [dto],
      });
      return pkg.versions[0];
    }

    const res = await api.post<{ data: ServicePackageResponseDTO }>(
      `${BASE}/me/packages/${pkgId}/versions/${versionId}/set-default`,
    );
    const pkg = toPackage(unwrap(res));
    return pkg.versions[0] ?? null;
  },

  updateMyProfile: async (data: UpdateMentorProfileRequest): Promise<User> => {
    const res = await api.put<{ data: MentorProfileResponseDTO }>(`${BASE}/me`, data);
    return toMentorUser(unwrap(res));
  },

  submitMyProfile: async (): Promise<User> => {
    const res = await api.post<{ data: MentorProfileResponseDTO }>(`${BASE}/me/profile/submit`);
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
    data: { title: string; description?: string; orderIndex: number; duration?: number },
  ) => {
    const res = await api.post(
      `${BASE}/me/packages/${pkgId}/versions/${verId}/curriculums`,
      data,
    );
    return unwrap(res);
  },

  getMyServices: async (): Promise<MentorPackage[]> => {
    const res = USE_MOCK
      ? await mockMentorApi.getMyServices()
      : await api.get<{ data: ServicePackageResponseDTO[] }>(`${BASE}/me/packages`);
    return (unwrap(res) ?? []).map(toPackage);
  },

  toggleServiceStatus: async (pkgId: string, isActive: boolean): Promise<void> => {
    if (USE_MOCK) {
      await mockMentorApi.toggleServiceStatus(pkgId, isActive);
    } else {
      await api.patch(`${BASE}/me/packages/${pkgId}/status`, { isActive });
    }
  },
};
