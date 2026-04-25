import { api, unwrap } from '@/src/core/api';
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

const BASE = '/api/v1/users';

export const userService = {
  getMe: async (): Promise<User> => {
    const res = USE_MOCK
      ? await mockUserApi.getMe()
      : await api.get<{ data: UserFullProfileResponseDTO }>(`${BASE}/me/profile`);

    return toUserFull(unwrap(res));
  },

  getPublicProfile: async (id: string | number): Promise<User> => {
    const res = USE_MOCK
      ? await mockUserApi.getPublicProfile(id)
      : await api.get<{ data: UserFullProfileResponseDTO }>(`${BASE}/${id}/profile`);

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

    await api.put(`${BASE}/me/profile`, data);
  },

  getEducations: async (): Promise<UserEducationResponseDTO[]> => {
    const res = USE_MOCK
      ? await mockUserApi.getEducations()
      : await api.get<{ data: UserEducationResponseDTO[] }>(`${BASE}/educations`);
    return unwrap(res);
  },

  addEducation: async (data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }): Promise<UserEducationResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.addEducation(data)
      : await api.post<{ data: UserEducationResponseDTO }>(`${BASE}/educations`, data);
    return unwrap(res);
  },

  updateEducation: async (
    id: number,
    data: Partial<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear: number | null;
    }>
  ): Promise<UserEducationResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.updateEducation(id, data)
      : await api.put<{ data: UserEducationResponseDTO }>(`${BASE}/educations/${id}`, data);
    return unwrap(res);
  },

  deleteEducation: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteEducation(id);
      return;
    }

    await api.delete(`${BASE}/educations/${id}`);
  },

  getExperiences: async (): Promise<UserExperienceResponseDTO[]> => {
    const res = USE_MOCK
      ? await mockUserApi.getExperiences()
      : await api.get<{ data: UserExperienceResponseDTO[] }>(`${BASE}/experiences`);
    return unwrap(res);
  },

  addExperience: async (data: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }): Promise<UserExperienceResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.addExperience(data)
      : await api.post<{ data: UserExperienceResponseDTO }>(`${BASE}/experiences`, data);
    return unwrap(res);
  },

  updateExperience: async (
    id: number,
    data: Partial<{
      company: string;
      role: string;
      startDate: string;
      endDate: string | null;
      description: string | null;
    }>
  ): Promise<UserExperienceResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.updateExperience(id, data)
      : await api.put<{ data: UserExperienceResponseDTO }>(`${BASE}/experiences/${id}`, data);
    return unwrap(res);
  },

  deleteExperience: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteExperience(id);
      return;
    }

    await api.delete(`${BASE}/experiences/${id}`);
  },

  getLanguages: async (): Promise<UserLanguageResponseDTO[]> => {
    const res = USE_MOCK
      ? await mockUserApi.getLanguages()
      : await api.get<{ data: UserLanguageResponseDTO[] }>(`${BASE}/languages`);
    return unwrap(res);
  },

  addLanguage: async (data: {
    language: string;
    proficiency: string;
  }): Promise<UserLanguageResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.addLanguage(data)
      : await api.post<{ data: UserLanguageResponseDTO }>(`${BASE}/languages`, data);
    return unwrap(res);
  },

  updateLanguage: async (
    id: number,
    data: { language?: string; proficiency?: string }
  ): Promise<UserLanguageResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.updateLanguage(id, data)
      : await api.put<{ data: UserLanguageResponseDTO }>(`${BASE}/languages/${id}`, data);
    return unwrap(res);
  },

  deleteLanguage: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteLanguage(id);
      return;
    }

    await api.delete(`${BASE}/languages/${id}`);
  },

  getCertificates: async (): Promise<UserCertificateResponseDTO[]> => {
    const res = USE_MOCK
      ? await mockUserApi.getCertificates()
      : await api.get<{ data: UserCertificateResponseDTO[] }>(`${BASE}/certificates`);
    return unwrap(res);
  },

  addCertificate: async (data: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }): Promise<UserCertificateResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.addCertificate(data)
      : await api.post<{ data: UserCertificateResponseDTO }>(`${BASE}/certificates`, data);
    return unwrap(res);
  },

  updateCertificate: async (
    id: number,
    data: Partial<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate: string | null;
      credentialUrl: string | null;
    }>
  ): Promise<UserCertificateResponseDTO> => {
    const res = USE_MOCK
      ? await mockUserApi.updateCertificate(id, data)
      : await api.put<{ data: UserCertificateResponseDTO }>(`${BASE}/certificates/${id}`, data);
    return unwrap(res);
  },

  deleteCertificate: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await mockUserApi.deleteCertificate(id);
      return;
    }

    await api.delete(`${BASE}/certificates/${id}`);
  },
};
