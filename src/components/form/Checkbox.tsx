import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  label,
  error,
  disabled
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.touchArea}
        onPress={() => onValueChange(!value)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={[
          styles.box,
          value && styles.boxChecked,
          error && styles.boxError,
          disabled && styles.boxDisabled
        ]}>
          {value && <Ionicons name="checkmark" size={16} color={theme.colors.surface} />}
        </View>
        {label && (
          <Typography 
            variant="body" 
            color={disabled ? 'disabled' : (error ? 'error' : 'primary')}
            style={styles.label}
          >
            {label}
          </Typography>
        )}
      </TouchableOpacity>
      {error && (
        <Typography variant="caption" color="error" style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  touchArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  boxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  boxError: {
    borderColor: theme.colors.error,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 32, // align với text
  }
});
