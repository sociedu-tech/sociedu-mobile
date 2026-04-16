import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme/theme';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { getCardStyle } from './cardResponsive';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export const Card = ({ children, style, ...rest }: CardProps) => {
  const breakpoint = useBreakpoint();
  const responsiveStyle = getCardStyle(breakpoint);
  return (
    <View
      style={[
        styles.card,
        responsiveStyle,
        responsiveStyle.maxWidth !== '100%' ? { alignSelf: 'center', width: '100%', maxWidth: responsiveStyle.maxWidth } : {},
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
});
