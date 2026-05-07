import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { bookingService } from '../../src/core/services/bookingService';
import { mentorService } from '../../src/core/services/mentorService';
import { Booking, User } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

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

      // Chỉ báo lỗi toàn màn hình nếu cả 3 API đều fail
      const allFailed =
        bookingsResult.status === 'rejected' &&
        servicesResult.status === 'rejected' &&
        profileResult.status === 'rejected';

      if (allFailed) {
        const firstError = bookingsResult.status === 'rejected' ? bookingsResult.reason : null;
        throw firstError || new Error(TEXT.MENTOR_DASHBOARD.LOAD_ERROR);
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
    const activeBookings = bookings.filter((booking) => booking.status === 'active').length;
    const now = Date.now();
    const upcomingSessions = bookings
      .filter((booking) => booking.status === 'active')
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

  if (loading) {
    return <LoadingState message={TEXT.MENTOR_DASHBOARD.LOADING} />;
  }

  if (error || !data) {
    return <ErrorState error={error || TEXT.MENTOR_DASHBOARD.LOAD_ERROR} onRetry={() => loadDashboard()} />;
  }

  const statCards = [
    {
      icon: 'calendar-outline' as const,
      label: TEXT.MENTOR_DASHBOARD.ACTIVE_BOOKINGS,
      value: String(stats.activeBookings),
      color: theme.colors.primary,
      backgroundColor: '#EEF2FF',
    },
    {
      icon: 'time-outline' as const,
      label: TEXT.MENTOR_DASHBOARD.UPCOMING_SESSIONS,
      value: String(stats.upcomingSessions),
      color: theme.colors.info,
      backgroundColor: '#EFF6FF',
    },
    {
      icon: 'briefcase-outline' as const,
      label: TEXT.MENTOR_DASHBOARD.ACTIVE_SERVICES,
      value: String(stats.activeServicesCount),
      color: theme.colors.success,
      backgroundColor: '#ECFDF5',
    },
    {
      icon: 'star-outline' as const,
      label: TEXT.MENTOR_DASHBOARD.AVERAGE_RATING,
      value:
        stats.ratingValue > 0
          ? stats.ratingValue.toFixed(1)
          : TEXT.MENTOR_DASHBOARD.EMPTY_RATING,
      color: theme.colors.warning,
      backgroundColor: '#FFFBEB',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadDashboard(true)}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons name="school-outline" size={28} color={theme.colors.primary} />
        </View>
        <Typography variant="h2" style={styles.heroTitle}>
          {TEXT.MENTOR_DASHBOARD.TITLE}
        </Typography>
        <Typography variant="body" color="secondary" style={styles.heroSubtitle}>
          {TEXT.MENTOR_DASHBOARD.SUBTITLE}
        </Typography>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((card) => (
          <View key={card.label} style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: card.backgroundColor }]}>
              <Ionicons name={card.icon} size={22} color={card.color} />
            </View>
            <Typography variant="caption" color="secondary" style={styles.statLabel}>
              {card.label}
            </Typography>
            <Typography variant="h3" style={styles.statValue}>
              {card.value}
            </Typography>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Typography variant="bodyMedium" style={styles.sectionTitle}>
          {TEXT.MENTOR_DASHBOARD.QUICK_LINKS}
        </Typography>

        <QuickLink
          icon="briefcase-outline"
          label={TEXT.MENTOR_DASHBOARD.GO_TO_SERVICES}
          onPress={() => router.push('/mentor/services')}
        />
        <QuickLink
          icon="calendar-outline"
          label={TEXT.MENTOR_DASHBOARD.GO_TO_BOOKINGS}
          onPress={() => router.push('/(tabs)/bookings')}
        />
        <QuickLink
          icon="person-outline"
          label={TEXT.MENTOR_DASHBOARD.GO_TO_PROFILE}
          onPress={() => router.push('/mentor/profile-edit')}
        />
        <QuickLink
          icon="document-text-outline"
          label={TEXT.PROGRESS_REPORT.LIST_TITLE}
          onPress={() => router.push('/mentor/progress-reports')}
        />
      </View>
    </ScrollView>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickLinkLeft}>
        <View style={styles.quickLinkIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <Typography variant="bodyMedium" style={styles.quickLinkText}>
          {label}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
    </TouchableOpacity>
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
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.lg,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.md,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    minHeight: 32,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontWeight: '800',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  quickLinkText: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
});
