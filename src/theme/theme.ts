/**
 * Core Design Tokens cho hệ thống UI UniShare Mobile
 * Áp dụng màu chủ đạo Indigo/Purple-Blue từ bản thiết kế
 */

export const theme = {
  colors: {
    // Primary - Tông Tím Xanh (Purple-Blue/Indigo) từ thiết kế mẫu
    primary: '#4F46E5', // Dùng cho button chính, icon active, viền khi select (VD: nút "Proceed to Payment")
    primaryLight: '#E0E7FF', // Thẻ "Need assistance", viền nhạt
    primaryLighter: '#F5F3FF', // Nền nút Time slot nhạt hoặc background phụ

    // Secondary & Neutral
    secondary: '#6B7280', // Text phụ, viền xám nhạt
    background: '#F9FAFB', // Nền ứng dụng chính (rất nhạt, gần như trắng)
    surface: '#FFFFFF', // Nền các Card trắng tinh
    
    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Text Colors
    text: {
      primary: '#111827', // Black/dark gray cho Tiêu đề (Header)
      secondary: '#6B7280', // Gray cho Mô tả
      disabled: '#9CA3AF',
      inverse: '#FFFFFF', // Text hiển thị trên nền primary (vd: Button text)
    },
    
    // Border
    border: {
      default: '#E5E7EB',
      active: '#4F46E5', // Border khi input/card được focus
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16, // Góc bo lớn như trong thẻ "Thesis Mentorship"
    pill: 9999, // Cho Button tròn 2 đầu
  },

  typography: {
    h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  }
};

export type Theme = typeof theme;
