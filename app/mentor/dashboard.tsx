import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { bookingService } from '../../src/core/services/bookingService';
import { mentorService } from '../../src/core/services/mentorService';
import { Booking, User } from '../../src/core/types';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { ListItem } from '../../src/components/ui/ListItem';

const { width } = Dimensions.get('window');

type DashboardData = {
  bookings: Booking[];
  servicesCount: number;
  activeServicesCount: number;
  mentorProfile: User | null;
};

function MentorDashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [bookingsResult, servicesResult, profileResult] = await Promise.allSettled([
        bookingService.getMyBookingsAsMentor(),
        mentorService.getMyServices(),
        mentorService.getMyProfile(),
      ]);

      const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
      const services = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
      const mentorProfile = profileResult.status === 'fulfilled' ? profileResult.value : null;

      const allFailed =
        bookingsResult.status === 'rejected' &&
        servicesResult.status === 'rejected' &&
        profileResult.status === 'rejected';

      if (allFailed) {
        throw new Error(TEXT.MENTOR_DASHBOARD.LOAD_ERROR);
      }

      setData({
        bookings,
        servicesCount: services.length,
        activeServicesCount: services.filter((service) => service.isActive).length,
        mentorProfile,
      });
    } catch (err: any) {
      setError(err?.message || TEXT.MENTOR_DASHBOARD.LOAD_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const bookings = data?.bookings ?? [];
    const activeBookings = bookings.filter((booking) =>
      ['active', 'pending', 'confirmed'].includes(booking.status)
    ).length;
    const now = Date.now();
    const upcomingSessions = bookings
      .filter((booking) => ['active', 'pending', 'confirmed'].includes(booking.status))
      .flatMap((booking) => booking.sessions)
      .filter((session) => {
        if (!session.scheduledAt) return false;
        if (session.status === 'completed' || session.status === 'cancelled') return false;
        return new Date(session.scheduledAt).getTime() > now;
      }).length;
    const ratingValue = data?.mentorProfile?.mentorInfo?.rating ?? 0;

    return {
      activeBookings,
      upcomingSessions,
      activeServicesCount: data?.activeServicesCount ?? 0,
      ratingValue,
    };
  }, [data]);

  if (loading) return <LoadingState message={TEXT.MENTOR_DASHBOARD.LOADING} />;
  if (error || !data) return <ErrorState error={error || TEXT.MENTOR_DASHBOARD.LOAD_ERROR} onRetry={() => loadDashboard()} />;

  const statCards = [
    {
      icon: 'calendar' as const,
      label: 'Lịch đặt',
      value: String(stats.activeBookings),
      color: theme.colors.primary,
      bg: theme.colors.primarySoft,
    },
    {
      icon: 'time' as const,
      label: 'Sắp tới',
      value: String(stats.upcomingSessions),
      color: theme.colors.info,
      bg: '#EFF6FF',
    },
    {
      icon: 'briefcase' as const,
      label: 'Dịch vụ',
      value: String(stats.activeServicesCount),
      color: theme.colors.success,
      bg: '#ECFDF5',
    },
    {
      icon: 'star' as const,
      label: 'Đánh giá',
      value: stats.ratingValue > 0 ? stats.ratingValue.toFixed(1) : 'N/A',
      color: theme.colors.warning,
      bg: '#FFFBEB',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* DASHBOARD HERO */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.heroGradient}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <Ionicons name="grid" size={24} color={theme.colors.primary} />
            </View>
            <Typography variant="h2" style={{ color: '#FFF', fontWeight: '900' }}>
              {TEXT.MENTOR_DASHBOARD.TITLE}
            </Typography>
            <Typography variant="body" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {TEXT.MENTOR_DASHBOARD.SUBTITLE}
            </Typography>
          </View>
        </LinearGradient>

        {/* STATS GRID */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {statCards.map((card) => (
              <Card key={card.label} variant="premium" style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: card.bg }]}>
                  <Ionicons name={card.icon} size={20} color={card.color} />
                </View>
                <Typography variant="h2" style={{ fontWeight: '900', color: theme.colors.text.primary }}>{card.value}</Typography>
                <Typography variant="caption" color="muted">{card.label}</Typography>
              </Card>
            ))}
          </View>
        </View>

        {/* QUICK LINKS SECTION */}
        <View style={styles.section}>
          <Typography variant="label" style={styles.sectionLabel}>Lối tắt quản lý</Typography>
          <Card style={styles.listCard}>
            <ListItem
              iconName="cube"
              title={TEXT.MENTOR_DASHBOARD.GO_TO_SERVICES}
              subtitle="Cập nhật gói dịch vụ của bạn"
              onPress={() => router.push('/mentor/services')}
            />
            <ListItem
              iconName="calendar"
              title={TEXT.MENTOR_DASHBOARD.GO_TO_BOOKINGS}
              subtitle="Theo dõi các buổi hẹn sắp tới"
              onPress={() => router.push('/(tabs)/bookings')}
            />
            <ListItem
              iconName="document-text"
              title={TEXT.PROGRESS_REPORT.LIST_TITLE}
              subtitle="Báo cáo tiến độ học viên"
              onPress={() => router.push('/mentor/progress-reports')}
            />
            <ListItem
              iconName="settings"
              title="Cấu hình Mentor"
              subtitle="Thay đổi hồ sơ & chuyên môn"
              onPress={() => router.push('/mentor/profile-edit')}
            />
          </Card>
        </View>

        {/* RECENT ACTIVITY PLACEHOLDER */}
        <View style={styles.section}>
          <Typography variant="label" style={styles.sectionLabel}>Thông báo mới nhất</Typography>
          <Card style={{ padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
            <Ionicons name="notifications-off-outline" size={32} color={theme.colors.border.default} />
            <Typography variant="caption" color="muted" style={{ marginTop: 8 }}>Chưa có thông báo mới nào</Typography>
          </Card>
        </View>

      </ScrollView>
    </View>
  );
}

export default function MentorDashboardScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorDashboardContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroGradient: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroIconBox: {
    width: 48, height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.soft,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 40 - 12) / 2,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  statIconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    color: theme.colors.text.muted,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  listCard: {
    paddingVertical: 0,
    borderRadius: 24,
    overflow: 'hidden',
  }
});
