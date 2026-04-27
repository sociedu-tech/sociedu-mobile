import { BACKEND_CONFIG } from './config';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

export const API_BASE_URL = trimTrailingSlash(BACKEND_CONFIG.baseUrl);
export const API_PREFIX = ensureLeadingSlash(BACKEND_CONFIG.apiPrefix);
export const API_ROOT = `${API_BASE_URL}${API_PREFIX}`;

export const API_PATHS = {
  auth: {
    login: `${API_PREFIX}/auth/login`,
    register: `${API_PREFIX}/auth/register`,
    refresh: `${API_PREFIX}/auth/refresh`,
    logout: `${API_PREFIX}/auth/logout`,
    forgotPassword: `${API_PREFIX}/auth/forgot-password`,
    resetPassword: `${API_PREFIX}/auth/reset-password`,
    verifyEmail: `${API_PREFIX}/auth/verify-email`,
    resendVerification: `${API_PREFIX}/auth/resend-verification`,
  },
  users: {
    meProfile: `${API_PREFIX}/users/me/profile`,
    publicProfile: (id: string | number) => `${API_PREFIX}/users/${id}/profile`,
    meEducations: `${API_PREFIX}/users/me/educations`,
    meEducationItem: (id: string | number) => `${API_PREFIX}/users/me/educations/${id}`,
    meExperiences: `${API_PREFIX}/users/me/experiences`,
    meExperienceItem: (id: string | number) => `${API_PREFIX}/users/me/experiences/${id}`,
    meLanguages: `${API_PREFIX}/users/me/languages`,
    meLanguageItem: (id: string | number) => `${API_PREFIX}/users/me/languages/${id}`,
    meCertificates: `${API_PREFIX}/users/me/certificates`,
    meCertificateItem: (id: string | number) => `${API_PREFIX}/users/me/certificates/${id}`,
  },
  mentors: {
    base: `${API_PREFIX}/mentors`,
    byId: (id: string | number) => `${API_PREFIX}/mentors/${id}`,
    packages: (id: string | number) => `${API_PREFIX}/mentors/${id}/packages`,
    me: `${API_PREFIX}/mentors/me`,
    mePackages: `${API_PREFIX}/mentors/me/packages`,
    mePackageItem: (id: string | number) => `${API_PREFIX}/mentors/me/packages/${id}`,
    curriculum: (pkgId: string | number, verId: string | number) =>
      `${API_PREFIX}/mentors/me/packages/${pkgId}/versions/${verId}/curriculums`,
  },
  servicePackages: {
    base: `${API_PREFIX}/service-packages`,
    byId: (id: string | number) => `${API_PREFIX}/service-packages/${id}`,
    versions: (id: string | number) => `${API_PREFIX}/service-packages/${id}/versions`,
    toggle: (id: string | number) => `${API_PREFIX}/service-packages/${id}/toggle`,
    curriculumItem: (pkgId: string | number, verId: string | number, curriculumId: string | number) =>
      `${API_PREFIX}/service-packages/${pkgId}/versions/${verId}/curriculums/${curriculumId}`,
  },
  bookings: {
    base: `${API_PREFIX}/bookings`,
    mineBuyer: `${API_PREFIX}/bookings/me/buyer`,
    mineMentor: `${API_PREFIX}/bookings/me/mentor`,
    byId: (id: string) => `${API_PREFIX}/bookings/${id}`,
    session: (bookingId: string, sessionId: string) =>
      `${API_PREFIX}/bookings/${bookingId}/sessions/${sessionId}`,
    evidences: (bookingId: string, sessionId: string) =>
      `${API_PREFIX}/bookings/${bookingId}/sessions/${sessionId}/evidences`,
  },
  orders: {
    checkout: `${API_PREFIX}/orders/checkout`,
    mine: `${API_PREFIX}/orders/me`,
    byId: (id: string) => `${API_PREFIX}/orders/${id}`,
  },
  files: {
    publicById: (fileId: string) => `${API_PREFIX}/files/${fileId}`,
    upload: `${API_PREFIX}/files/upload`,
    uploadFieldName: BACKEND_CONFIG.uploadFieldName,
  },
} as const;

export function buildAbsoluteApiUrl(path: string): string {
  return `${API_BASE_URL}${ensureLeadingSlash(path)}`;
}

export function getBackendIntegrationSnapshot() {
  return {
    baseUrl: API_BASE_URL,
    apiPrefix: API_PREFIX,
    apiRoot: API_ROOT,
    expectedLoginUrl: buildAbsoluteApiUrl(API_PATHS.auth.login),
    expectedRegisterUrl: buildAbsoluteApiUrl(API_PATHS.auth.register),
    expectedProfileUrl: buildAbsoluteApiUrl(API_PATHS.users.meProfile),
    expectedRefreshUrl: buildAbsoluteApiUrl(API_PATHS.auth.refresh),
    uploadFieldName: API_PATHS.files.uploadFieldName,
    vnpayReturnScheme: BACKEND_CONFIG.vnpayReturnScheme,
  };
}
