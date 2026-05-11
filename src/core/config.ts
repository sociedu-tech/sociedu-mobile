/**
 * Shared mobile configuration.
 */

// Toggle mock APIs globally.
export const USE_MOCK = false;

/**
 * Backend integration configuration.
 *
 * Expected runtime shape:
 *   https://vietdemo.com/api_mentor/api/v1/...
 */
export const BACKEND_CONFIG = {
  baseUrl: "http://192.168.104.89:9992",
  apiPrefix: "/api/v1",
  uploadFieldName: "file",
  vnpayReturnScheme: "unisharemobile://payment-result",
} as const;
