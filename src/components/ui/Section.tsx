import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { getSectionStyle } from './sectionResponsive';

interface SectionProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export const Section = ({ children, style, ...rest }: SectionProps) => {
  const breakpoint = useBreakpoint();
  const responsiveStyle = getSectionStyle(breakpoint);
  return (
    <View
      style={[
        styles.section,
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
  section: {},
});
