// src/theme/useBreakpoint.ts
import { useWindowDimensions } from 'react-native';
import { getBreakpoint, Breakpoint } from './breakpoints';

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return getBreakpoint(width);
}
