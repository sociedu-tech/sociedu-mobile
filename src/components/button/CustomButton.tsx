import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
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
  ...rest
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border.default;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.primaryLight;
      case 'destructive': return theme.colors.error;
      case 'outline': 
      case 'ghost': 
        return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.text.disabled;
    switch (variant) {
      case 'primary':
      case 'destructive': 
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

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        styles[size],
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0, // Viền dày một chút cho nổi bật
        },
        style
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Typography 
            variant={size === 'sm' ? 'label' : 'bodyMedium'} 
            color={getTextColor()}
            weight="600"
          >
            {label}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  md: {
    paddingVertical: 14, // Pad lớn chút cho chạm trên di động dễ dàng
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: theme.spacing.sm,
  }
});
