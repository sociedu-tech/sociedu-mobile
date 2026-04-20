// src/components/ui/cardResponsive.ts
import { Breakpoint } from '../../theme/breakpoints';
import { theme } from '../../theme/theme';

export const cardResponsive = {
  xs: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    maxWidth: '100%',
  },
  sm: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '100%',
  },
  md: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    maxWidth: 480,
  },
  lg: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    maxWidth: 600,
  },
  xl: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    maxWidth: 800,
  },
};

export function getCardStyle(breakpoint: Breakpoint) {
  return cardResponsive[breakpoint];
}
