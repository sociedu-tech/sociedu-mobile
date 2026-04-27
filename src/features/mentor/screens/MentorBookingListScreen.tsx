import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { Booking, BookingStatus } from '@/src/core/types';
import { bookingService } from '@/src/features/booking/services/bookingService';
import { theme } from '@/src/theme/theme';

type FilterStatus = 'all' | BookingStatus;

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
];

function getStatusConfig(status: BookingStatus) {
  switch (status) {
    case 'completed':
      return { label: 'Hoàn thành', color: theme.colors.success };
    case 'cancelled':
      return { label: 'Đã hủy', color: theme.colors.error };
    default:
      return { label: 'Đang hoạt động', color: theme.colors.primary };
  }
}

function MentorBookingListContent() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await bookingService.getMyBookingsAsMentor();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch hẹn.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((booking) => booking.status === filter);

  if (loading && bookings.length === 0) {
    return <LoadingState message="Đang tải lịch hẹn mentor..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadData()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          Lịch hẹn Mentor
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((item) => {
          const isActive = filter === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(item.value)}
              activeOpacity={0.8}
            >
              <Typography
                variant="caption"
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData(true);
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Không có lịch hẹn"
            description="Chưa có lịch hẹn nào phù hợp với bộ lọc."
            icon="calendar-outline"
            fullScreen={false}
          />
        }
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);
          const totalSessions = item.sessions.length;
          const completedSessions = item.sessions.filter((session) => session.status === 'completed').length;

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/booking/${item.id}` as any)}
            >
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                      Mã đơn: {item.orderId.slice(0, 8)}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ marginTop: 2 }}>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
                    <Typography variant="caption" style={{ color: statusConfig.color, fontWeight: '700' }}>
                      {statusConfig.label}
                    </Typography>
                  </View>
                </View>

                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="book-outline" size={14} color={theme.colors.text.secondary} />
                    <Typography variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                      {completedSessions}/{totalSessions} buổi
                    </Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

export default function MentorBookingListScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorBookingListContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: { padding: theme.spacing.sm, marginLeft: -theme.spacing.sm },
  headerTitle: { fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: { color: theme.colors.text.secondary, fontWeight: '600' },
  filterChipTextActive: { color: theme.colors.text.inverse },
  listContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  card: { marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
});
