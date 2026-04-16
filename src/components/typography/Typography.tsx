import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { getTypographyVariant } from './typographyResponsive';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption' | 'label';
type ThemeColor = keyof typeof theme.colors.text;

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: ThemeColor | string; // Cho phép dùng key của theme ('primary', 'secondary') hoặc mã hex
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
  children,
  ...rest
}) => {
  // Lấy breakpoint hiện tại
  const breakpoint = useBreakpoint();

  // Lấy style responsive theo variant & breakpoint
  const variantStyle = getTypographyVariant(variant, breakpoint);

  // Lấy màu từ theme hoặc trả về chính string đó
  const getTextColor = (col: string) => {
    if (theme.colors.text[col as ThemeColor]) {
      return theme.colors.text[col as ThemeColor];
    }
    return col;
  };

  // Ghi đè weight nếu được truyền explict props
  const fontWeightProp = weight ? { fontWeight: weight } : {};

  return (
    <Text
      style={[
        variantStyle,
        { color: getTextColor(color), textAlign: align },
        fontWeightProp,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
