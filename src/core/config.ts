/**
 * Shared mobile configuration.
 */

// Toggle mock APIs globally.
export const USE_MOCK = true;

/**
 * Backend integration configuration.
 *
 * Expected runtime shape:
 *   https://vietdemo.com/api_mentor/api/v1/...
 */
export const BACKEND_CONFIG = {
  baseUrl: "https://vietdemo.com/api_mentor",
  apiPrefix: "/api/v1",
  uploadFieldName: "file",
  vnpayReturnScheme: "unisharemobile://payment-result",
} as const;
