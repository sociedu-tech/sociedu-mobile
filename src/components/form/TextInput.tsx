import React, { useState } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  TextInputProps as RNTextInputProps, 
  StyleSheet 
} from 'react-native';
import { useBreakpoint } from '../../theme/useBreakpoint';
import { Typography } from '../typography/Typography';
import { getTextInputStyle } from './textInputResponsive';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isTextArea?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isTextArea = false,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const breakpoint = useBreakpoint();
  getTextInputStyle(breakpoint);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border.default;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label" color={error ? 'error' : 'primary'} style={styles.label}>
          {label}
        </Typography>
      )}
      
      <View style={[
        styles.inputContainer, 
        { 
          borderColor: getBorderColor(),
          backgroundColor: isFocused ? '#FFF' : '#F8FAFC', // Đổi màu nền khi focus
        },
        isFocused && theme.shadows.soft, // Thêm bóng đổ khi focus
        isTextArea && styles.textAreaContainer
      ]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={isFocused ? theme.colors.primary : theme.colors.secondary} style={styles.leftIcon} />
        )}
        
        <RNTextInput
          style={[
            styles.input, 
            isTextArea && styles.textAreaInput,
            style
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.text.disabled}
          multiline={isTextArea}
          textAlignVertical={isTextArea ? 'top' : 'center'}
          {...rest}
        />

        {rightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color={theme.colors.secondary} 
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>

      <View style={styles.messageContainer}>
        {error ? (
          <Typography variant="caption" color="error">{error}</Typography>
        ) : helperText ? (
          <Typography variant="caption" color="secondary">{helperText}</Typography>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, // Dày hơn chút để trông cao cấp
    borderRadius: theme.borderRadius.lg, // Bo góc lớn chuẩn mobile hiện đại
    backgroundColor: '#F8FAFC',
    minHeight: 52, // Độ cao chuẩn touch-friendly
  },
  textAreaContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontFamily: 'System',
    fontSize: theme.typography.body.fontSize,
    paddingVertical: 0,
    marginLeft: theme.spacing.sm,
  },
  textAreaInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  leftIcon: {
    marginLeft: theme.spacing.sm,
  },
  rightIcon: {
    marginRight: theme.spacing.sm,
  },
  messageContainer: {
    marginTop: 4,
    minHeight: 18,
  }
});
