// src/components/form/textInputResponsive.ts
import { Breakpoint } from '../../theme/breakpoints';
import { theme } from '../../theme/theme';

export const textInputResponsive = {
  xs: {
    paddingHorizontal: theme.spacing.sm,
    minHeight: 36,
    fontSize: 13,
    borderRadius: theme.borderRadius.sm,
  },
  sm: {
    paddingHorizontal: theme.spacing.md,
    minHeight: 40,
    fontSize: 14,
    borderRadius: theme.borderRadius.md,
  },
  md: {
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
    fontSize: 15,
    borderRadius: theme.borderRadius.lg,
  },
  lg: {
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
    fontSize: 16,
    borderRadius: theme.borderRadius.xl,
  },
  xl: {
    paddingHorizontal: theme.spacing.xl,
    minHeight: 64,
    fontSize: 18,
    borderRadius: theme.borderRadius.xl,
  },
};

export function getTextInputStyle(breakpoint: Breakpoint) {
  return textInputResponsive[breakpoint];
}
