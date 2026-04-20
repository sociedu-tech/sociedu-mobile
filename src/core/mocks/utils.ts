/**
 * Mocks Utils
 */

/**
 * Hàm giả lập độ trễ mạng ảo (delay)
 * Mặc định delay từ 500ms đến 1200ms ngẫu nhiên để giống thật.
 */
export const delay = (ms?: number) => {
  const finalMs = ms ?? Math.floor(Math.random() * 700) + 500;
  return new Promise((resolve) => setTimeout(resolve, finalMs));
};

/**
 * Trình bọc (Wrapper) giả lập cấu trúc trả về của Spring Boot API.
 * Nếu không mock, thì axios interceptor hoặc hàm unwrap() sẽ xử lý bóc tách data.
 */
export const withApiResponse = <T>(data: T) => {
  return {
    data: {
      code: 200,
      isSuccess: true,
      message: "Success (Mock)",
      data,
      errors: {},
      timestamp: new Date().toISOString()
    }
  };
};
