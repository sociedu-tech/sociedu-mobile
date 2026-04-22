// src/components/typography/typographyResponsive.ts
import { Breakpoint } from '../../theme/breakpoints';

// Responsive typography tokens by breakpoint
export const typographyResponsive = {
  h1: {
    xs: { fontSize: 22, lineHeight: 28 },
    sm: { fontSize: 26, lineHeight: 32 },
    md: { fontSize: 28, lineHeight: 36 },
    lg: { fontSize: 32, lineHeight: 40 },
    xl: { fontSize: 36, lineHeight: 44 },
  },
  h2: {
    xs: { fontSize: 18, lineHeight: 24 },
    sm: { fontSize: 20, lineHeight: 28 },
    md: { fontSize: 22, lineHeight: 30 },
    lg: { fontSize: 24, lineHeight: 32 },
    xl: { fontSize: 28, lineHeight: 36 },
  },
  h3: {
    xs: { fontSize: 15, lineHeight: 20 },
    sm: { fontSize: 17, lineHeight: 22 },
    md: { fontSize: 18, lineHeight: 24 },
    lg: { fontSize: 20, lineHeight: 28 },
    xl: { fontSize: 22, lineHeight: 30 },
  },
  body: {
    xs: { fontSize: 13, lineHeight: 18 },
    sm: { fontSize: 14, lineHeight: 20 },
    md: { fontSize: 15, lineHeight: 22 },
    lg: { fontSize: 16, lineHeight: 24 },
    xl: { fontSize: 18, lineHeight: 26 },
  },
  bodyMedium: {
    xs: { fontSize: 14, lineHeight: 20 },
    sm: { fontSize: 15, lineHeight: 22 },
    md: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 17, lineHeight: 26 },
    xl: { fontSize: 19, lineHeight: 28 },
  },
  caption: {
    xs: { fontSize: 10, lineHeight: 14 },
    sm: { fontSize: 11, lineHeight: 15 },
    md: { fontSize: 12, lineHeight: 16 },
    lg: { fontSize: 13, lineHeight: 18 },
    xl: { fontSize: 14, lineHeight: 20 },
  },
  label: {
    xs: { fontSize: 11, lineHeight: 14 },
    sm: { fontSize: 12, lineHeight: 16 },
    md: { fontSize: 13, lineHeight: 18 },
    lg: { fontSize: 14, lineHeight: 20 },
    xl: { fontSize: 16, lineHeight: 22 },
  },
};

export function getTypographyVariant(variant: keyof typeof typographyResponsive, breakpoint: Breakpoint) {
  return typographyResponsive[variant][breakpoint];
}
