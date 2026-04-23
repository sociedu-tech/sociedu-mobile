import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../src/components/typography/Typography';
import { EmptyState } from '../../src/components/states/EmptyState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';
import { useBookingStore, getUpcomingBookings, getCompletedBookings, getCanceledBookings } from '../../src/core/store/bookingStore';
import { useAuthStore } from '../../src/core/store/authStore';
import { Booking } from '../../src/core/types';
import { Ionicons } from '@expo/vector-icons';
import { TEXT } from '../../src/core/constants/strings';

// Mock Skeleton Component
const SkeletonCard = () => (
  <View style={[styles.card, { opacity: 0.7 }]}>
    <View style={{ width: '50%', height: 20, backgroundColor: theme.colors.border.default, borderRadius: 4, marginBottom: 12 }} />
    <View style={{ width: '80%', height: 16, backgroundColor: theme.colors.border.default, borderRadius: 4 }} />
  </View>
);

// ─── Định nghĩa Tab ─────────────────────────────────────────────
type BookingTab = 'upcoming' | 'completed' | 'cancelled';

interface TabConfig {
  key: BookingTab;
  label: string;
  statuses: string[];         // trạng thái API tương ứng
  icon: string;
  emptyTitle: string;
  emptyDesc: string;
  emptyIcon: string;
}

const TABS: TabConfig[] = [
  {
    key: 'upcoming',
    label: TEXT.BOOKING.TAB_UPCOMING,
    statuses: ['active', 'pending', 'confirmed'],
    icon: 'time-outline',
    emptyTitle: TEXT.BOOKING.EMPTY_UPCOMING,
    emptyDesc: 'Đặt lịch với Mentor để bắt đầu hành trình học tập của bạn.',
    emptyIcon: 'calendar-outline',
  },
  {
    key: 'completed',
    label: TEXT.BOOKING.TAB_COMPLETED,
    statuses: ['completed'],
    icon: 'checkmark-circle-outline',
    emptyTitle: TEXT.BOOKING.EMPTY_COMPLETED,
    emptyDesc: 'Các buổi học đã kết thúc sẽ xuất hiện ở đây.',
    emptyIcon: 'trophy-outline',
  },
  {
    key: 'cancelled',
    label: TEXT.BOOKING.TAB_CANCELLED,
    statuses: ['cancelled'],
    icon: 'close-circle-outline',
    emptyTitle: TEXT.BOOKING.EMPTY_CANCELLED,
    emptyDesc: 'Các lịch hẹn đã hủy sẽ được lưu tại đây.',
    emptyIcon: 'ban-outline',
  },
];

// ─── Badge màu theo status ───────────────────────────────────────
function getStatusStyle(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'completed':
      return { bg: '#BBF7D0', color: '#15803D', label: 'Hoàn thành' };
    case 'cancelled':
      return { bg: '#FECACA', color: '#DC2626', label: 'Đã hủy' };
    case 'confirmed':
      return { bg: '#DBEAFE', color: '#1D4ED8', label: 'Đã xác nhận' };
    case 'pending':
      return { bg: '#FEF3C7', color: '#D97706', label: 'Chờ xác nhận' };
    case 'active':
    default:
      return { bg: theme.colors.primaryLight, color: theme.colors.primary, label: 'Đang diễn ra' };
  }
}

// ─── Booking Card ────────────────────────────────────────────────
function BookingCard({ item, onPress }: { item: Booking; onPress: () => void }) {
  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Row 1: Mã + Badge trạng thái */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={styles.calendarIconBg}>
            <Ionicons name="calendar" size={16} color={theme.colors.primary} />
          </View>
          <Typography variant="bodyMedium" style={styles.cardTitle} numberOfLines={1}>
            {'Mã: ' + item.id.slice(0, 8).toUpperCase()}
          </Typography>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Typography variant="caption" style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Typography>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.text.disabled} />
        </View>
      </View>

      {/* Row 2: Meta info */}
      <View style={styles.cardBody}>
        <View style={styles.metaItem}>
          <Ionicons name="book-outline" size={13} color={theme.colors.text.secondary} />
          <Typography variant="caption" color="secondary" style={styles.metaText}>
            {item.sessions.length + ' buổi học'}
          </Typography>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={theme.colors.text.secondary} />
          <Typography variant="caption" color="secondary" style={styles.metaText}>
            {'Tạo: ' + new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function BookingsTab() {
  const router = useRouter();
  const role = useAuthStore((s) => s.userRole);
  
  // Dùng selector nguyên khối để render nhanh, nhưng extract state riêng cho việc khác
  const bookingStoreState = useBookingStore();
  const { loading, error, fetchBuyerBookings, fetchMentorBookings } = bookingStoreState;
  
  // Áp dụng selector
  const upcomingList = getUpcomingBookings(bookingStoreState);
  const completedList = getCompletedBookings(bookingStoreState);
  const canceledList = getCanceledBookings(bookingStoreState);

  const [activeTab, setActiveTab] = useState<BookingTab>('upcoming');
  const indicatorAnim = useRef(new Animated.Value(0)).current;

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

  // Animated tab indicator
  const handleTabPress = (tab: BookingTab, index: number) => {
    setActiveTab(tab);
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: false,
      tension: 70,
      friction: 10,
    }).start();
  };

  const currentTabConfig = TABS.find((t) => t.key === activeTab)!;
  const filteredBookings = activeTab === 'upcoming' ? upcomingList 
    : activeTab === 'completed' ? completedList 
    : canceledList;

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  const tabCount = TABS.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ══════════ HEADER ══════════ */}
      <View style={styles.header}>
        <Typography variant="h2" style={styles.headerTitle}>
          {TEXT.BOOKING.LIST_TITLE}
        </Typography>
        <Typography variant="caption" color="secondary">
          {bookingStoreState.bookings.length + ' ' + TEXT.BOOKING.TOTAL_COUNT}
        </Typography>
      </View>

      {/* ══════════ TAB BAR ══════════ */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const count = bookingStoreState.bookings.filter((b: Booking) => tab.statuses.includes(b.status)).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.key, index)}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? theme.colors.primary : theme.colors.text.secondary}
                />
                <Typography
                  variant="label"
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {tab.label}
                </Typography>
                {count > 0 && (
                  <View style={[
                    styles.countBadge,
                    { backgroundColor: isActive ? theme.colors.primary : theme.colors.border.default },
                  ]}>
                    <Typography
                      variant="caption"
                      style={[styles.countText, { color: isActive ? '#FFF' : theme.colors.text.secondary }]}
                    >
                      {String(count)}
                    </Typography>
                  </View>
                )}
              </View>
              {/* Underline indicator */}
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ══════════ LIST ══════════ */}
      {loading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadData}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              onPress={() => router.push(`/booking/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={currentTabConfig.emptyTitle}
              description={currentTabConfig.emptyDesc}
              icon={currentTabConfig.emptyIcon as any}
              fullScreen={false}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
  tabLabelInactive: {
    color: theme.colors.text.secondary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // List
  list: {
    padding: 16,
    paddingBottom: 80,
  },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  calendarIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '700',
    flex: 1,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 10,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.border.default,
  },
  metaText: {
    fontSize: 12,
  },
});

