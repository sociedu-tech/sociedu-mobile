// src/components/button/buttonResponsive.ts
import { Breakpoint } from '../../theme/breakpoints';
import { theme } from '../../theme/theme';

export const buttonResponsive = {
  xs: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
    borderRadius: theme.borderRadius.sm,
    fontSize: 13,
  },
  sm: {
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 40,
    borderRadius: theme.borderRadius.md,
    fontSize: 14,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 48,
    borderRadius: theme.borderRadius.lg,
    fontSize: 16,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
    borderRadius: theme.borderRadius.xl,
    fontSize: 18,
  },
  xl: {
    paddingVertical: 22,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 64,
    borderRadius: theme.borderRadius.xl,
    fontSize: 20,
  },
};

export function getButtonStyle(breakpoint: Breakpoint) {
  return buttonResponsive[breakpoint];
}
