import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBreakpoint } from '../../src/theme/useBreakpoint';
import { Typography } from '../../src/components/typography/Typography';
import { EmptyState } from '../../src/components/states/EmptyState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';
import { useBookingStore } from '../../src/core/store/bookingStore';
import { useAuthStore } from '../../src/core/store/authStore';
import { Booking } from '../../src/core/types';
import { Ionicons } from '@expo/vector-icons';

export default function BookingsTab() {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const role = useAuthStore((s) => s.userRole);
  const { bookings, loading, error, fetchBuyerBookings, fetchMentorBookings } = useBookingStore();

  const loadData = async () => {
    if (role === 'mentor') {
      await fetchMentorBookings();
    } else {
      await fetchBuyerBookings();
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  if (loading && bookings.length === 0) {
    return <LoadingState message="Đang tải lịch hẹn..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={{
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
      }}
      activeOpacity={0.8}
      onPress={() => router.push(`/booking/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          <Typography variant="bodyMedium" style={styles.title}>
            Mã lịch hẹn: {item.id.slice(0, 8).toUpperCase()}
          </Typography>
        </View>
        <View style={[styles.statusBadge, styles[`status_${item.status}` as keyof typeof styles] as any]}>
          <Typography variant="caption" style={styles.statusText}>
            {item.status.toUpperCase()}
          </Typography>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Typography variant="body" color="secondary">
          {item.sessions.length} buổi học
        </Typography>
        <Typography variant="caption" color="secondary" style={styles.date}>
          Tạo ngày: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="h2" style={styles.headerTitle}>Lịch hẹn của tôi</Typography>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.colors.primary} />}
        renderItem={renderBooking}
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
