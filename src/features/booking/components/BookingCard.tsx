import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/src/components/typography/Typography';
import { Booking } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

export function BookingCard({ booking, onPress }: BookingCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          <Typography variant="bodyMedium" style={styles.title}>
            Ma lich hen: {booking.id.slice(0, 8).toUpperCase()}
          </Typography>
        </View>
        <View style={[styles.statusBadge, styles[`status_${booking.status}` as keyof typeof styles] as any]}>
          <Typography variant="caption" style={styles.statusText}>
            {booking.status.toUpperCase()}
          </Typography>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Typography variant="body" color="secondary">
          {booking.sessions.length} buoi hoc
        </Typography>
        <Typography variant="caption" color="secondary" style={styles.date}>
          Tao ngay: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  status_active: {
    backgroundColor: theme.colors.primaryLight,
  },
  status_completed: {
    backgroundColor: '#BBF7D0',
  },
  status_cancelled: {
    backgroundColor: '#FECACA',
  },
  statusText: {
    fontWeight: '700',
    fontSize: 10,
    color: theme.colors.text.primary,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontStyle: 'italic',
  },
});
