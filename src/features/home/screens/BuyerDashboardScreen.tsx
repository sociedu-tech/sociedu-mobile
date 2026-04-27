import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section } from '@/src/components/ui/Section';
import { TEXT } from '@/src/core/constants/strings';
import { Booking, BookingSession } from '@/src/core/types';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { bookingService } from '@/src/features/booking/services/bookingService';
import { theme } from '@/src/theme/theme';

interface UpcomingSession {
  bookingId: string;
  session: BookingSession;
  sessionIndex: number;
}

function extractUpcomingSessions(bookings: Booking[]): UpcomingSession[] {
  const upcoming: UpcomingSession[] = [];
  const now = Date.now();

  for (const booking of bookings) {
    if (booking.status !== 'active') {
      continue;
    }

    for (let index = 0; index < booking.sessions.length; index += 1) {
      const session = booking.sessions[index];
      if (session.status === 'pending' || session.status === 'in_progress') {
        const scheduledTime = session.scheduledAt ? new Date(session.scheduledAt).getTime() : now + 86400000;
        if (scheduledTime >= now) {
          upcoming.push({ bookingId: booking.id, session, sessionIndex: index });
        }
      }
    }
  }

  upcoming.sort((first, second) => {
    const timeA = first.session.scheduledAt ? new Date(first.session.scheduledAt).getTime() : Infinity;
    const timeB = second.session.scheduledAt ? new Date(second.session.scheduledAt).getTime() : Infinity;
    return timeA - timeB;
  });

  return upcoming.slice(0, 5);
}

export default function BuyerDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    try {
      const data = await bookingService.getMyBookingsAsBuyer();
      setBookings(data);
    } catch {
      // Fail silently on dashboard — data is supplementary
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeBookings = bookings.filter((booking) => booking.status === 'active');
  const completedBookings = bookings.filter((booking) => booking.status === 'completed');
  const upcomingSessions = extractUpcomingSessions(bookings);
  const firstName = user?.firstName ?? '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        showsVerticalScrollIndicator={false}
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
      >
        {/* Welcome header */}
        <Section>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1 }}>
              <Typography variant="h2" style={styles.welcomeTitle}>
                {TEXT.DASHBOARD.WELCOME}, {firstName || 'bạn'} 👋
              </Typography>
              <Typography variant="body" color="secondary">
                Cùng theo dõi tiến trình học tập hôm nay.
              </Typography>
            </View>
          </View>
        </Section>

        {/* Stats cards */}
        <Section>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <Typography variant="h2" style={styles.statNumber}>
                {activeBookings.length}
              </Typography>
              <Typography variant="caption" color="secondary">
                {TEXT.DASHBOARD.ACTIVE_BOOKINGS}
              </Typography>
            </Card>

            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              </View>
              <Typography variant="h2" style={styles.statNumber}>
                {completedBookings.length}
              </Typography>
              <Typography variant="caption" color="secondary">
                Đã hoàn thành
              </Typography>
            </Card>

            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="book" size={20} color={theme.colors.info} />
              </View>
              <Typography variant="h2" style={styles.statNumber}>
                {bookings.reduce((sum, booking) => sum + booking.sessions.length, 0)}
              </Typography>
              <Typography variant="caption" color="secondary">
                Tổng buổi học
              </Typography>
            </Card>
          </View>
        </Section>

        {/* Upcoming sessions */}
        <Section>
          <Typography variant="h3" style={styles.sectionTitle}>
            {TEXT.DASHBOARD.UPCOMING_SESSIONS}
          </Typography>

          {loading ? (
            <Card style={styles.placeholderCard}>
              <Typography variant="body" color="secondary">Đang tải...</Typography>
            </Card>
          ) : upcomingSessions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={28} color={theme.colors.text.disabled} />
              <Typography variant="body" color="disabled" style={{ marginTop: theme.spacing.sm }}>
                {TEXT.DASHBOARD.NO_UPCOMING}
              </Typography>
            </Card>
          ) : (
            upcomingSessions.map((item) => (
              <TouchableOpacity
                key={`${item.bookingId}-${item.session.id}`}
                activeOpacity={0.8}
                onPress={() => router.push(`/booking/${item.bookingId}` as any)}
              >
                <Card style={styles.sessionCard}>
                  <View style={styles.sessionRow}>
                    <View style={styles.sessionDot} />
                    <View style={{ flex: 1 }}>
                      <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                        Buổi {item.sessionIndex + 1}: {item.session.title}
                      </Typography>
                      <View style={styles.sessionMeta}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                        <Typography variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                          {item.session.scheduledAt
                            ? new Date(item.session.scheduledAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Chưa xếp lịch'}
                        </Typography>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.text.disabled} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </Section>

        {/* Quick actions */}
        <Section>
          <Typography variant="h3" style={styles.sectionTitle}>
            {TEXT.DASHBOARD.QUICK_ACTIONS}
          </Typography>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/mentor' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="search" size={22} color={theme.colors.primary} />
              </View>
              <Typography variant="caption" style={styles.actionLabel}>
                {TEXT.DASHBOARD.FIND_MENTOR}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/bookings' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="calendar" size={22} color={theme.colors.success} />
              </View>
              <Typography variant="caption" style={styles.actionLabel}>
                {TEXT.DASHBOARD.VIEW_BOOKINGS}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/messages' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="chatbubbles" size={22} color={theme.colors.info} />
              </View>
              <Typography variant="caption" style={styles.actionLabel}>
                {TEXT.DASHBOARD.VIEW_MESSAGES}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/progress' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="trending-up" size={22} color={theme.colors.warning} />
              </View>
              <Typography variant="caption" style={styles.actionLabel}>
                Tiến độ
              </Typography>
            </TouchableOpacity>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  welcomeRow: { flexDirection: 'row', alignItems: 'center' },
  welcomeTitle: { fontWeight: '800', color: theme.colors.text.primary, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  statCard: { flex: 1, alignItems: 'center', padding: theme.spacing.md },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statNumber: { fontWeight: '800', color: theme.colors.text.primary, marginBottom: 2 },
  sectionTitle: { fontWeight: '700', marginBottom: theme.spacing.md },
  placeholderCard: { padding: theme.spacing.lg, alignItems: 'center' },
  emptyCard: { padding: theme.spacing.xl, alignItems: 'center' },
  sessionCard: { marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  sessionRow: { flexDirection: 'row', alignItems: 'center' },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionLabel: { fontWeight: '700', color: theme.colors.text.primary },
});
