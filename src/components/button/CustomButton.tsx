import React, { useRef } from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator, 
  View,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { getButtonStyle } from './buttonResponsive';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CustomButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  onPress,
  ...rest
}) => {
  const breakpoint = useBreakpoint();
  const responsiveStyle = getButtonStyle(breakpoint);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (e: any) => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border.default;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.primarySoft;
      case 'destructive': return theme.colors.error;
      case 'outline': 
      case 'ghost': 
      case 'gradient':
        return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.text.disabled;
    switch (variant) {
      case 'primary':
      case 'destructive': 
      case 'gradient':
        return theme.colors.text.inverse;
      case 'secondary': 
      case 'outline': 
      case 'ghost': 
        return theme.colors.primary;
      default: return theme.colors.text.inverse;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border.default;
    if (variant === 'outline') return theme.colors.primary;
    return 'transparent';
  };

  const Content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Typography
            variant={size === 'sm' ? 'label' : 'bodyMedium'}
            color={getTextColor()}
            weight="700"
            style={{ fontSize: responsiveStyle.fontSize }}
          >
            {label}
          </Typography>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.container,
          {
            paddingVertical: responsiveStyle.paddingVertical,
            paddingHorizontal: responsiveStyle.paddingHorizontal,
            minHeight: responsiveStyle.minHeight,
            borderRadius: responsiveStyle.borderRadius,
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === 'outline' ? 1.5 : 0,
          },
          variant === 'primary' && theme.shadows.soft,
          style,
        ]}
        {...rest}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={theme.colors.gradients.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: responsiveStyle.borderRadius }]}
          >
            {Content}
          </LinearGradient>
        ) : (
          Content
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sm: {},
  md: {},
  lg: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: theme.spacing.sm,
  }
});
