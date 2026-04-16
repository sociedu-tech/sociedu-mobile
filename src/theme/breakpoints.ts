// src/theme/breakpoints.ts
// Breakpoint system for responsive UI

export const breakpoints = {
  xs: 0,        // < 360px
  sm: 360,      // 360–480px
  md: 480,      // 480–768px
  lg: 768,      // 768–1024px
  xl: 1024,     // > 1024px
};

export type Breakpoint = keyof typeof breakpoints;

export function getBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  return 'xl';
}
