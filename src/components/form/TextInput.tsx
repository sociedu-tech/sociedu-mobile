import React, { useState } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  TextInputProps as RNTextInputProps, 
  StyleSheet 
} from 'react-native';
import { Typography } from '../typography/Typography';
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
        { borderColor: getBorderColor() },
        isTextArea && styles.textAreaContainer
      ]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={theme.colors.secondary} style={styles.leftIcon} />
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
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  textAreaContainer: {
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.typography.body.fontSize,
  },
  textAreaInput: {
    minHeight: 100,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  messageContainer: {
    marginTop: 4,
    minHeight: 18,
  }
});
