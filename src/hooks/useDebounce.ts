import { useState, useEffect } from 'react';

/**
 * useDebounce
 * ─────────────────────────────────────────────
 * Trả về giá trị đã được debounce sau `delay` ms.
 * Dùng để tránh gọi API liên tục khi user đang gõ.
 *
 * @example
 *   const debouncedSearch = useDebounce(searchTerm, 300);
 *   useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy timer cũ nếu value thay đổi trước khi hết delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
