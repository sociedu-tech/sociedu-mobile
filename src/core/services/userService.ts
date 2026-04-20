/**
 * userService.ts – User profile domain
 *
 * Endpoints:
 *   GET  /api/v1/users/me/profile    → UserFullProfileResponse
 *   PUT  /api/v1/users/me/profile    → cập nhật profile
 *   GET/POST/PUT/DELETE /educations
 *   GET/POST/PUT/DELETE /experiences
 *   GET/POST/PUT/DELETE /languages
 *   GET/POST/PUT/DELETE /certificates
 */
import { api, unwrap } from '../api';
import {
  UserFullProfileResponseDTO,
  UserEducationResponseDTO,
  UserExperienceResponseDTO,
  UserLanguageResponseDTO,
  UserCertificateResponseDTO,
  User,
} from '../types';
import { toUserFull } from '../adapters/userAdapter';
import { USE_MOCK } from '../config';
import { mockUserApi } from '../mocks/api/mockUserMentorApi';

const BASE = '/api/v1/users';

export const userService = {
  /**
   * Profile đầy đủ của user hiện tại (bao gồm education, experience...)
   */
  getMe: async (): Promise<User> => {
    const res = USE_MOCK
      ? await mockUserApi.getMe()
      : await api.get<{ data: UserFullProfileResponseDTO }>(`${BASE}/me/profile`);
    return toUserFull(unwrap(res));
  },

  /**
   * Profile công khai của user/mentor
   */
  getPublicProfile: async (id: string | number): Promise<User> => {
    const res = USE_MOCK
      ? await mockUserApi.getPublicProfile(id)
      : await api.get<{ data: UserFullProfileResponseDTO }>(`${BASE}/${id}/profile`);
    return toUserFull(unwrap(res));
  },

  /**
   * Cập nhật thông tin profile cơ bản
   */
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    location?: string;
  }): Promise<void> => {
    await api.put(`${BASE}/me/profile`, data);
  },

  // ── Education ──────────────────────────────────────────────

  getEducations: async (): Promise<UserEducationResponseDTO[]> => {
    const res = await api.get<{ data: UserEducationResponseDTO[] }>(`${BASE}/educations`);
    return unwrap(res);
  },

  addEducation: async (data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }): Promise<UserEducationResponseDTO> => {
    const res = await api.post<{ data: UserEducationResponseDTO }>(`${BASE}/educations`, data);
    return unwrap(res);
  },

  updateEducation: async (id: number, data: Partial<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number | null;
  }>): Promise<UserEducationResponseDTO> => {
    const res = await api.put<{ data: UserEducationResponseDTO }>(`${BASE}/educations/${id}`, data);
    return unwrap(res);
  },

  deleteEducation: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/educations/${id}`);
  },

  // ── Experience ─────────────────────────────────────────────

  getExperiences: async (): Promise<UserExperienceResponseDTO[]> => {
    const res = await api.get<{ data: UserExperienceResponseDTO[] }>(`${BASE}/experiences`);
    return unwrap(res);
  },

  addExperience: async (data: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }): Promise<UserExperienceResponseDTO> => {
    const res = await api.post<{ data: UserExperienceResponseDTO }>(`${BASE}/experiences`, data);
    return unwrap(res);
  },

  updateExperience: async (id: number, data: Partial<{
    company: string;
    role: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }>): Promise<UserExperienceResponseDTO> => {
    const res = await api.put<{ data: UserExperienceResponseDTO }>(`${BASE}/experiences/${id}`, data);
    return unwrap(res);
  },

  deleteExperience: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/experiences/${id}`);
  },

  // ── Language ───────────────────────────────────────────────

  getLanguages: async (): Promise<UserLanguageResponseDTO[]> => {
    const res = await api.get<{ data: UserLanguageResponseDTO[] }>(`${BASE}/languages`);
    return unwrap(res);
  },

  addLanguage: async (data: {
    language: string;
    proficiency: string;
  }): Promise<UserLanguageResponseDTO> => {
    const res = await api.post<{ data: UserLanguageResponseDTO }>(`${BASE}/languages`, data);
    return unwrap(res);
  },

  updateLanguage: async (id: number, data: { language?: string; proficiency?: string }): Promise<UserLanguageResponseDTO> => {
    const res = await api.put<{ data: UserLanguageResponseDTO }>(`${BASE}/languages/${id}`, data);
    return unwrap(res);
  },

  deleteLanguage: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/languages/${id}`);
  },

  // ── Certificate ────────────────────────────────────────────

  getCertificates: async (): Promise<UserCertificateResponseDTO[]> => {
    const res = await api.get<{ data: UserCertificateResponseDTO[] }>(`${BASE}/certificates`);
    return unwrap(res);
  },

  addCertificate: async (data: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }): Promise<UserCertificateResponseDTO> => {
    const res = await api.post<{ data: UserCertificateResponseDTO }>(`${BASE}/certificates`, data);
    return unwrap(res);
  },

  updateCertificate: async (id: number, data: Partial<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string | null;
    credentialUrl: string | null;
  }>): Promise<UserCertificateResponseDTO> => {
    const res = await api.put<{ data: UserCertificateResponseDTO }>(`${BASE}/certificates/${id}`, data);
    return unwrap(res);
  },

  deleteCertificate: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/certificates/${id}`);
  },
};
