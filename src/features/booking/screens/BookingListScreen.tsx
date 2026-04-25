import React, { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { UserRole } from '@/src/core/types';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { theme } from '@/src/theme/theme';

import { BookingCard } from '../components/BookingCard';
import { useBookingStore } from '../store/bookingStore';

export default function BookingListScreen() {
  const router = useRouter();
  const role = useAuthStore((s) => s.activeRole);
  const effectiveRoles = useAuthStore((s) => s.effectiveRoles);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const { bookings, loading, error, fetchBuyerBookings, fetchMentorBookings } = useBookingStore();
  const contextRoles = effectiveRoles.filter(
    (item): item is Extract<UserRole, 'user' | 'mentor'> => item === 'user' || item === 'mentor'
  );

  const loadData = useCallback(async () => {
    if (role === 'mentor') {
      await fetchMentorBookings();
      return;
    }

    await fetchBuyerBookings();
  }, [fetchBuyerBookings, fetchMentorBookings, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && bookings.length === 0) {
    return <LoadingState message="Dang tai lich hen..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="h2" style={styles.headerTitle}>
          {role === 'mentor' ? 'Lịch hẹn mentor' : 'Lịch hẹn của tôi'}
        </Typography>
        {contextRoles.length > 1 && (
          <View style={styles.roleSwitchRow}>
            {contextRoles.map((item) => {
              const active = role === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  onPress={() => setActiveRole(item)}
                  activeOpacity={0.8}
                >
                  <Typography
                    variant="caption"
                    style={[styles.roleChipText, active && styles.roleChipTextActive]}
                  >
                    {item === 'mentor' ? 'Mentor' : 'Người dùng'}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(booking) => booking.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.colors.primary} />}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => router.push(`/booking/${item.id}` as any)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Chưa có lịch hẹn nào"
            description="Bạn hiện chưa có lịch hẹn nào trong hệ thống."
            icon="calendar-outline"
            fullScreen={false}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  headerTitle: {
    color: theme.colors.text.primary,
  },
  roleSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  roleChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleChipText: {
    color: theme.colors.text.secondary,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: theme.colors.text.inverse,
  },
  list: {
    padding: 16,
  },
});
