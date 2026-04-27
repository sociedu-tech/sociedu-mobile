import Constants from 'expo-constants';

function getEnvValue(key: string): string | undefined {
  const fromProcess =
    key === 'EXPO_PUBLIC_API_BASE_URL'
      ? process.env.EXPO_PUBLIC_API_BASE_URL
      : key === 'EXPO_PUBLIC_USE_MOCK'
        ? process.env.EXPO_PUBLIC_USE_MOCK
        : undefined;
  const fromExpoConfig = Constants.expoConfig?.extra?.[key];

  return typeof fromProcess === 'string' && fromProcess.length > 0
    ? fromProcess
    : typeof fromExpoConfig === 'string'
      ? fromExpoConfig
      : undefined;
}

function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

function isProductionRuntime() {
  return process.env.NODE_ENV === 'production' || Constants.expoConfig?.extra?.APP_ENV === 'production';
}

const rawApiBaseUrl = getEnvValue('EXPO_PUBLIC_API_BASE_URL');

export const API_BASE_URL = rawApiBaseUrl ?? 'http://localhost:8080';
export const USE_MOCK = parseBoolean(getEnvValue('EXPO_PUBLIC_USE_MOCK')) || !rawApiBaseUrl;

if (isProductionRuntime()) {
  if (!rawApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL for production build.');
  }

  if (!rawApiBaseUrl.startsWith('https://')) {
    throw new Error('Production API base URL must use HTTPS.');
  }

  if (USE_MOCK) {
    throw new Error('Mock API must be disabled in production build.');
  }
}
