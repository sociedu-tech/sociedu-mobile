import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../typography/Typography';
import { theme } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  right?: React.ReactNode;
  style?: any;
}

export const ListItem = ({ title, subtitle, iconName, onPress, right, style }: ListItemProps) => (
  <TouchableOpacity style={[styles.row, style]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    {iconName && (
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={22} color={theme.colors.secondary} />
      </View>
    )}
    <View style={styles.content}>
      <Typography variant="bodyMedium" style={styles.title}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="secondary" style={styles.subtitle}>{subtitle}</Typography>}
    </View>
    {right}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  iconBox: {
    width: 36,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
});
