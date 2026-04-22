import React, { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { theme } from '@/src/theme/theme';

import { BookingCard } from '../components/BookingCard';
import { useBookingStore } from '../store/bookingStore';

export default function BookingListScreen() {
  const router = useRouter();
  const role = useAuthStore((s) => s.userRole);
  const { bookings, loading, error, fetchBuyerBookings, fetchMentorBookings } = useBookingStore();

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
        <Typography variant="h2" style={styles.headerTitle}>Lich hen cua toi</Typography>
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
            title="Chua co lich hen nao"
            description="Ban hien chua co lich hen nao trong he thong."
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
  list: {
    padding: 16,
  },
});
