import { Dimensions, Platform } from 'react-native';

/**
 * Responsive Utilities
 * ─────────────────────────────────────────────────────
 * Provides scaling functions for font sizes, spacing, and dimensions
 * based on screen size to ensure consistent appearance across devices.
 * 
 * Scaling is based on:
 * - Base: 375px (iPhone 6/7/8 width) = 1x scale
 * - Scales up/down proportionally for other sizes
 */

const REFERENCE_WIDTH = 375; // iPhone 6/7/8 width
const REFERENCE_HEIGHT = 812; // iPhone X height

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate scale factors
const widthScale = width / REFERENCE_WIDTH;
const heightScale = height / REFERENCE_HEIGHT;

// Use geometric mean for more balanced scaling
export const SCREEN_SCALE = Math.sqrt(widthScale * heightScale);

/**
 * Scale a font size value responsively
 * @param baseFontSize - The base font size (for 375px width)
 * @returns Scaled font size value
 */
export const scaleFont = (baseFontSize: number): number => {
  return Math.round(baseFontSize * SCREEN_SCALE);
};

/**
 * Scale a spacing/dimension value responsively
 * @param baseValue - The base value (for 375px width)
 * @returns Scaled value
 */
export const scaleSpace = (baseValue: number): number => {
  return Math.round(baseValue * widthScale);
};

/**
 * Scale based on width only (for horizontal measurements)
 * @param baseValue - The base value (for 375px width)
 * @returns Scaled value
 */
export const scaleWidth = (baseValue: number): number => {
  return Math.round(baseValue * widthScale);
};

/**
 * Scale based on height only (for vertical measurements)
 * @param baseValue - The base value (for 812px height)
 * @returns Scaled value
 */
export const scaleHeight = (baseValue: number): number => {
  return Math.round(baseValue * heightScale);
};

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = () => {
  return { width, height, SCREEN_SCALE, widthScale, heightScale };
};

/**
 * Determine if device is tablet (width >= 600px or iPad)
 */
export const isTablet = (): boolean => {
  const isLargeScreen = width >= 600;
  const isIPad = Platform.OS === 'ios' && width > 450;
  return isLargeScreen || isIPad;
};

/**
 * Determine if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return width > height;
};

/**
 * Get responsive number of columns for grid layouts
 */
export const getGridColumns = (): number => {
  if (width >= 900) return 3;
  if (width >= 600) return 2;
  return 1;
};

export default {
  scaleFont,
  scaleSpace,
  scaleWidth,
  scaleHeight,
  getScreenDimensions,
  isTablet,
  isLandscape,
  getGridColumns,
};
