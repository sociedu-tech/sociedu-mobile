


export const theme = {
  colors: {
    // Primary - Indigo/Violet Premium
    primary: '#4F46E5', // Indigo 600
    primaryDark: '#3730A3', // Indigo 800
    primaryLight: '#818CF8', // Indigo 400
    primaryLighter: '#E0E7FF', // Indigo 100
    primarySoft: '#F5F3FF', // Indigo 50
    
    // Gradients (Định nghĩa mảng màu cho expo-linear-gradient)
    gradients: {
      primary: ['#4F46E5', '#7C3AED'] as const, // Indigo to Violet
      surface: ['#FFFFFF', '#F8FAFC'] as const,
      success: ['#10B981', '#059669'] as const,
      warning: ['#F59E0B', '#D97706'] as const,
      info: ['#3B82F6', '#2563EB'] as const,
    },

    // Secondary & Neutral
    secondary: '#64748B', 
    background: '#F8FAFC', 
    surface: '#FFFFFF',
    
    // Status
    success: '#10B981', 
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Text Colors
    text: {
      primary: '#0F172A', // Slate 900 cho độ tương phản cao
      secondary: '#475569', // Slate 600
      muted: '#94A3B8', // Slate 400
      disabled: '#CBD5E1',
      inverse: '#FFFFFF',
    },
    
    // Border
    border: {
      default: '#E2E8F0',
      light: '#F1F5F9',
      active: '#4F46E5',
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  shadows: {
    soft: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    medium: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
    premium: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    }
  },

  typography: {
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
    },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const, letterSpacing: 0.2 },
  }
};

export type Theme = typeof theme;
