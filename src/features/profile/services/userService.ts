import { api, unwrap } from '@/src/core/api';
import { API_PATHS } from '@/src/core/backend';
import { USE_MOCK } from '@/src/core/config';
import { mockUserApi } from '@/src/core/mocks/api/mockUserMentorApi';
import {
  User,
  UserCertificateResponseDTO,
  UserEducationResponseDTO,
  UserExperienceResponseDTO,
  UserFullProfileResponseDTO,
  UserLanguageResponseDTO,
} from '@/src/core/types';

import { toUserFull } from '../adapters/userAdapter';

function toIsoDateFromYear(year?: number | null, month = 1, day = 1): string | undefined {
  if (!year) {
    return undefined;
  }

  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

export const userService = {
  getMe: async (): Promise<User> => {
    const res = USE_MOCK
      ? await mockUserApi.getMe()
      : await api.get<{ data: UserFullProfileResponseDTO }>(API_PATHS.users.meProfile);

    return toUserFull(unwrap(res));
  },

  getPublicProfile: async (id: string | number): Promise<User> => {
    const res = USE_MOCK
      ? await mockUserApi.getPublicProfile(id)
      : await api.get<{ data: UserFullProfileResponseDTO }>(API_PATHS.users.publicProfile(id));

    return toUserFull(unwrap(res));
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    location?: string;
  }): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.updateProfile(data);
      return;
    }

    await api.put(API_PATHS.users.meProfile, data);
  },

  getEducations: async (): Promise<UserEducationResponseDTO[]> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.getEducations());
    }

    return unwrap(await api.get<{ data: UserEducationResponseDTO[] }>(API_PATHS.users.meEducations));
  },

  addEducation: async (data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }): Promise<UserEducationResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.addEducation(data));
    }

    return unwrap(
      await api.post<{ data: UserEducationResponseDTO }>(API_PATHS.users.meEducations, {
        universityId: null,
        majorId: null,
        degree: data.degree,
        startDate: toIsoDateFromYear(data.startYear),
        endDate: toIsoDateFromYear(data.endYear, 12, 31),
        isCurrent: data.endYear == null,
        description: [data.institution, data.fieldOfStudy].filter(Boolean).join(' - ') || null,
      })
    );
  },

  updateEducation: async (
    id: string | number,
    data: Partial<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear: number | null;
    }>
  ): Promise<UserEducationResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.updateEducation(id, data));
    }

    return unwrap(
      await api.put<{ data: UserEducationResponseDTO }>(API_PATHS.users.meEducationItem(id), {
        universityId: null,
        majorId: null,
        degree: data.degree ?? '',
        startDate: toIsoDateFromYear(data.startYear),
        endDate: data.endYear === null ? null : toIsoDateFromYear(data.endYear, 12, 31),
        isCurrent: data.endYear == null,
        description: [data.institution, data.fieldOfStudy].filter(Boolean).join(' - ') || null,
      })
    );
  },

  deleteEducation: async (id: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteEducation(id);
      return;
    }

    await api.delete(API_PATHS.users.meEducationItem(id));
  },

  getExperiences: async (): Promise<UserExperienceResponseDTO[]> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.getExperiences());
    }

    return unwrap(await api.get<{ data: UserExperienceResponseDTO[] }>(API_PATHS.users.meExperiences));
  },

  addExperience: async (data: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }): Promise<UserExperienceResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.addExperience(data));
    }

    return unwrap(
      await api.post<{ data: UserExperienceResponseDTO }>(API_PATHS.users.meExperiences, {
        company: data.company,
        position: data.role,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: !data.endDate,
        description: data.description,
      })
    );
  },

  updateExperience: async (
    id: string | number,
    data: Partial<{
      company: string;
      role: string;
      startDate: string;
      endDate: string | null;
      description: string | null;
    }>
  ): Promise<UserExperienceResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.updateExperience(id, data));
    }

    return unwrap(
      await api.put<{ data: UserExperienceResponseDTO }>(API_PATHS.users.meExperienceItem(id), {
        company: data.company ?? '',
        position: data.role ?? '',
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: !data.endDate,
        description: data.description,
      })
    );
  },

  deleteExperience: async (id: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteExperience(id);
      return;
    }

    await api.delete(API_PATHS.users.meExperienceItem(id));
  },

  getLanguages: async (): Promise<UserLanguageResponseDTO[]> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.getLanguages());
    }

    return unwrap(await api.get<{ data: UserLanguageResponseDTO[] }>(API_PATHS.users.meLanguages));
  },

  addLanguage: async (data: {
    language: string;
    proficiency: string;
  }): Promise<UserLanguageResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.addLanguage(data));
    }

    return unwrap(
      await api.post<{ data: UserLanguageResponseDTO }>(API_PATHS.users.meLanguages, {
        language: data.language,
        level: data.proficiency,
      })
    );
  },

  updateLanguage: async (
    id: string | number,
    data: { language?: string; proficiency?: string }
  ): Promise<UserLanguageResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.updateLanguage(id, data));
    }

    return unwrap(
      await api.put<{ data: UserLanguageResponseDTO }>(API_PATHS.users.meLanguageItem(id), {
        language: data.language ?? '',
        level: data.proficiency ?? '',
      })
    );
  },

  deleteLanguage: async (id: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteLanguage(id);
      return;
    }

    await api.delete(API_PATHS.users.meLanguageItem(id));
  },

  getCertificates: async (): Promise<UserCertificateResponseDTO[]> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.getCertificates());
    }

    return unwrap(await api.get<{ data: UserCertificateResponseDTO[] }>(API_PATHS.users.meCertificates));
  },

  addCertificate: async (data: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }): Promise<UserCertificateResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.addCertificate(data));
    }

    return unwrap(
      await api.post<{ data: UserCertificateResponseDTO }>(API_PATHS.users.meCertificates, {
        name: data.name,
        organization: data.issuer,
        issueDate: data.issueDate,
        expirationDate: data.expiryDate,
        credentialFileId: null,
        description: data.credentialUrl ?? null,
      })
    );
  },

  updateCertificate: async (
    id: string | number,
    data: Partial<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate: string | null;
      credentialUrl: string | null;
    }>
  ): Promise<UserCertificateResponseDTO> => {
    if (USE_MOCK) {
      return unwrap(await mockUserApi.updateCertificate(id, data));
    }

    return unwrap(
      await api.put<{ data: UserCertificateResponseDTO }>(API_PATHS.users.meCertificateItem(id), {
        name: data.name ?? '',
        organization: data.issuer ?? '',
        issueDate: data.issueDate,
        expirationDate: data.expiryDate,
        credentialFileId: null,
        description: data.credentialUrl ?? null,
      })
    );
  },

  deleteCertificate: async (id: string | number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteCertificate(id);
      return;
    }

    await api.delete(API_PATHS.users.meCertificateItem(id));
  },
};
