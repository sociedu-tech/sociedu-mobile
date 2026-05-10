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
        <Ionicons name={iconName} size={20} color={theme.colors.primary} />
      </View>
    )}
    <View style={styles.content}>
      <Typography variant="bodyMedium" style={styles.title}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="muted" style={styles.subtitle}>{subtitle}</Typography>}
    </View>
    {right || (onPress && <Ionicons name="chevron-forward" size={18} color={theme.colors.border.default} />)}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  iconBox: {
    width: 38, height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 12,
  },
});
