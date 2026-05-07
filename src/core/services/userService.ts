import { toUserFull } from '../adapters/userAdapter';
import { API_PATHS } from '../backend';
import { USE_MOCK } from '../config';
import { mockUserApi } from '../mocks/api/mockUserMentorApi';
import { api, unwrap } from '../api';
import {
  UserFullProfileResponseDTO,
  UserProfileResponseDTO,
  UserEducationResponseDTO,
  UserExperienceResponseDTO,
  UserLanguageResponseDTO,
  UserCertificateResponseDTO,
  User,
} from '../types';

function isProfileShape(value: unknown): value is UserProfileResponseDTO {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'userId' in value &&
      'firstName' in value &&
      'lastName' in value,
  );
}

function normalizeUserFullProfile(payload: unknown): UserFullProfileResponseDTO {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Phan hoi ho so nguoi dung khong hop le.');
  }

  if ('profile' in payload) {
    const fullProfile = payload as UserFullProfileResponseDTO;
    if (isProfileShape(fullProfile.profile)) {
      return {
        profile: fullProfile.profile,
        educations: fullProfile.educations ?? [],
        experiences: fullProfile.experiences ?? [],
        languages: fullProfile.languages ?? [],
        certificates: fullProfile.certificates ?? [],
      };
    }
  }

  if (isProfileShape(payload)) {
    return {
      profile: payload,
      educations: [],
      experiences: [],
      languages: [],
      certificates: [],
    };
  }

  throw new Error('Phan hoi ho so nguoi dung thieu du lieu profile.');
}

export const userService = {
  getMe: async (): Promise<User> => {
    const response = USE_MOCK
      ? await mockUserApi.getMe()
      : await api.get<{ data: UserFullProfileResponseDTO }>(API_PATHS.users.meProfile);

    return toUserFull(normalizeUserFullProfile(unwrap(response)));
  },

  getPublicProfile: async (id: string | number): Promise<User> => {
    const response = USE_MOCK
      ? await mockUserApi.getPublicProfile(id)
      : await api.get<{ data: UserFullProfileResponseDTO }>(API_PATHS.users.publicProfile(id));

    return toUserFull(normalizeUserFullProfile(unwrap(response)));
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    location?: string;
  }): Promise<void> => {
    await api.put(API_PATHS.users.meProfile, data);
  },

  getEducations: async (): Promise<UserEducationResponseDTO[]> => {
    const response = await api.get<{ data: UserEducationResponseDTO[] }>(API_PATHS.users.educationList);
    return unwrap(response);
  },

  addEducation: async (data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }): Promise<UserEducationResponseDTO> => {
    const response = await api.post<{ data: UserEducationResponseDTO }>(API_PATHS.users.educationList, data);
    return unwrap(response);
  },

  updateEducation: async (
    id: number,
    data: Partial<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear: number | null;
    }>,
  ): Promise<UserEducationResponseDTO> => {
    const response = await api.put<{ data: UserEducationResponseDTO }>(
      API_PATHS.users.educationItem(id),
      data,
    );
    return unwrap(response);
  },

  deleteEducation: async (id: number): Promise<void> => {
    await api.delete(API_PATHS.users.educationItem(id));
  },

  getExperiences: async (): Promise<UserExperienceResponseDTO[]> => {
    const response = await api.get<{ data: UserExperienceResponseDTO[] }>(API_PATHS.users.experienceList);
    return unwrap(response);
  },

  addExperience: async (data: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }): Promise<UserExperienceResponseDTO> => {
    const response = await api.post<{ data: UserExperienceResponseDTO }>(API_PATHS.users.experienceList, data);
    return unwrap(response);
  },

  updateExperience: async (
    id: number,
    data: Partial<{
      company: string;
      role: string;
      startDate: string;
      endDate: string | null;
      description: string | null;
    }>,
  ): Promise<UserExperienceResponseDTO> => {
    const response = await api.put<{ data: UserExperienceResponseDTO }>(
      API_PATHS.users.experienceItem(id),
      data,
    );
    return unwrap(response);
  },

  deleteExperience: async (id: number): Promise<void> => {
    await api.delete(API_PATHS.users.experienceItem(id));
  },

  getLanguages: async (): Promise<UserLanguageResponseDTO[]> => {
    const response = await api.get<{ data: UserLanguageResponseDTO[] }>(API_PATHS.users.languageList);
    return unwrap(response);
  },

  addLanguage: async (data: {
    language: string;
    proficiency: string;
  }): Promise<UserLanguageResponseDTO> => {
    const response = await api.post<{ data: UserLanguageResponseDTO }>(API_PATHS.users.languageList, data);
    return unwrap(response);
  },

  updateLanguage: async (
    id: number,
    data: { language?: string; proficiency?: string },
  ): Promise<UserLanguageResponseDTO> => {
    const response = await api.put<{ data: UserLanguageResponseDTO }>(
      API_PATHS.users.languageItem(id),
      data,
    );
    return unwrap(response);
  },

  deleteLanguage: async (id: number): Promise<void> => {
    await api.delete(API_PATHS.users.languageItem(id));
  },

  getCertificates: async (): Promise<UserCertificateResponseDTO[]> => {
    const response = await api.get<{ data: UserCertificateResponseDTO[] }>(API_PATHS.users.certificateList);
    return unwrap(response);
  },

  addCertificate: async (data: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }): Promise<UserCertificateResponseDTO> => {
    const response = await api.post<{ data: UserCertificateResponseDTO }>(
      API_PATHS.users.certificateList,
      data,
    );
    return unwrap(response);
  },

  updateCertificate: async (
    id: number,
    data: Partial<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate: string | null;
      credentialUrl: string | null;
    }>,
  ): Promise<UserCertificateResponseDTO> => {
    const response = await api.put<{ data: UserCertificateResponseDTO }>(
      API_PATHS.users.certificateItem(id),
      data,
    );
    return unwrap(response);
  },

  deleteCertificate: async (id: number): Promise<void> => {
    await api.delete(API_PATHS.users.certificateItem(id));
  },
};
