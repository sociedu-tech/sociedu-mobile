// src/components/ui/sectionResponsive.ts
import { Breakpoint } from '../../theme/breakpoints';
import { theme } from '../../theme/theme';

export const sectionResponsive = {
  xs: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    maxWidth: '100%',
  },
  sm: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    maxWidth: '100%',
  },
  md: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    maxWidth: 480,
  },
  lg: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    maxWidth: 600,
  },
  xl: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    maxWidth: 800,
  },
};

export function getSectionStyle(breakpoint: Breakpoint) {
  return sectionResponsive[breakpoint];
}
