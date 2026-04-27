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
    educationList: `${API_PREFIX}/users/educations`,
    educationItem: (id: number) => `${API_PREFIX}/users/educations/${id}`,
    experienceList: `${API_PREFIX}/users/experiences`,
    experienceItem: (id: number) => `${API_PREFIX}/users/experiences/${id}`,
    languageList: `${API_PREFIX}/users/languages`,
    languageItem: (id: number) => `${API_PREFIX}/users/languages/${id}`,
    certificateList: `${API_PREFIX}/users/certificates`,
    certificateItem: (id: number) => `${API_PREFIX}/users/certificates/${id}`,
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
