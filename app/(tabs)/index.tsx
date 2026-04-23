import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { Section } from '../../src/components/ui/Section';
import { useAuthStore } from '../../src/core/store/authStore';
import { useBookingStore } from '../../src/core/store/bookingStore';

// ═══════════════════════════════════════════════════════════════
//  DỮ LIỆU TĨNH
// ═══════════════════════════════════════════════════════════════
const HIGHLIGHTS = [
  {
    icon: 'people-outline' as const,
    title: 'Mentor chất lượng',
    desc: 'Kết nối với sinh viên xuất sắc và chuyên gia trong ngành.',
    color: theme.colors.primary,
    bg: theme.colors.primaryLight,
  },
  {
    icon: 'chatbubbles-outline' as const,
    title: 'Tư vấn 1-1',
    desc: 'Đặt lịch hẹn và nhận tư vấn trực tiếp với mentor.',
    color: theme.colors.success,
    bg: '#D1FAE5',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Đã xác minh',
    desc: 'Mọi mentor đều được hệ thống xác minh năng lực.',
    color: theme.colors.info,
    bg: '#DBEAFE',
  },
];

const MENTOR_QUICK_ACTIONS = [
  {
    icon: 'calendar-outline' as const,
    label: 'Lịch hẹn',
    route: '/(tabs)/bookings',
    color: theme.colors.primary,
    bg: theme.colors.primaryLight,
  },
  {
    icon: 'chatbubbles-outline' as const,
    label: 'Tin nhắn',
    route: '/(tabs)/messages',
    color: theme.colors.success,
    bg: '#D1FAE5',
  },
  {
    icon: 'person-outline' as const,
    label: 'Hồ sơ',
    route: '/(tabs)/profile',
    color: theme.colors.info,
    bg: '#DBEAFE',
  },
  {
    icon: 'cube-outline' as const,
    label: 'Dịch vụ',
    route: '/mentor/services',
    color: theme.colors.warning,
    bg: '#FEF3C7',
  },
];

// ═══════════════════════════════════════════════════════════════
//  BUYER HOME – Landing page giới thiệu
// ═══════════════════════════════════════════════════════════════
function BuyerHome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <Section>
          <Animated.View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 28, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.heroIcon}>
              <Ionicons name="school" size={36} color={theme.colors.primary} />
            </View>
            <Typography variant="h1" align="center">
              {'Tìm kiếm '}
              <Typography variant="h1" style={{ color: theme.colors.primary, fontWeight: '900' }}>Mentor</Typography>
              {'\nhoàn hảo cho bạn'}
            </Typography>
            <Typography variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.md }}>
              {'Kết nối với những người đi trước giàu kinh nghiệm để nhận được lời khuyên, định hướng và học hỏi.'}
            </Typography>
            <CustomButton
              label="Khám phá Mentor"
              variant="primary"
              size="lg"
              icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
              onPress={() => router.push('/(tabs)/mentor' as any)}
              style={styles.heroButton}
            />
          </Animated.View>
        </Section>

        {/* HIGHLIGHTS */}
        <Section>
          <Typography variant="h3" align="center" style={styles.sectionTitle}>
            {'Tại sao chọn UniShare?'}
          </Typography>
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <View style={[styles.highlightIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.text.primary, marginBottom: 2 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="secondary">{item.desc}</Typography>
              </View>
            </Card>
          ))}
        </Section>

        {/* STATS */}
        <Section>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.primary, marginBottom: 2 }}>{'500+'}</Typography>
                <Typography variant="caption" color="secondary">{'Mentor'}</Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.primary, marginBottom: 2 }}>{'2K+'}</Typography>
                <Typography variant="caption" color="secondary">{'Buổi học'}</Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.primary, marginBottom: 2 }}>{'4.8'}</Typography>
                <Typography variant="caption" color="secondary">{'Đánh giá'}</Typography>
              </View>
            </View>
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MENTOR HOME – Dashboard tổng quan
// ═══════════════════════════════════════════════════════════════
function MentorHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { bookings } = useBookingStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const upcomingCount = bookings.filter((b) => ['active', 'pending', 'confirmed'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const displayName = user?.email?.split('@')[0] || 'Mentor';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* GREETING HEADER */}
        <View style={styles.mentorHeader}>
          <View style={styles.mentorHeaderContent}>
            <Typography variant="caption" style={styles.mentorGreetingLabel}>
              {'Chào mừng trở lại 👋'}
            </Typography>
            <Typography variant="h2" style={styles.mentorGreetingName}>
              {displayName}
            </Typography>
            <Typography variant="body" style={styles.mentorGreetingSubtitle}>
              {'Hôm nay bạn có ' + upcomingCount + ' lịch hẹn sắp tới'}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={styles.mentorAvatarBtn}
          >
            <View style={styles.mentorAvatarCircle}>
              <Typography variant="h3" style={{ color: theme.colors.primary, fontWeight: '900' }}>
                {displayName.charAt(0).toUpperCase()}
              </Typography>
            </View>
          </TouchableOpacity>
        </View>

        {/* STATS CARDS */}
        <Section>
          <Typography variant="h3" style={styles.sectionTitle}>
            {'Tổng quan'}
          </Typography>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { borderLeftColor: theme.colors.primary }]}>
              <Typography variant="h2" style={[styles.statNumber, { color: theme.colors.primary }]}>
                {String(upcomingCount)}
              </Typography>
              <Typography variant="caption" color="secondary">{'Sắp tới'}</Typography>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: theme.colors.success }]}>
              <Typography variant="h2" style={[styles.statNumber, { color: theme.colors.success }]}>
                {String(completedCount)}
              </Typography>
              <Typography variant="caption" color="secondary">{'Hoàn thành'}</Typography>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: theme.colors.warning }]}>
              <Typography variant="h2" style={[styles.statNumber, { color: theme.colors.warning }]}>
                {'4.8'}
              </Typography>
              <Typography variant="caption" color="secondary">{'Đánh giá'}</Typography>
            </Card>
          </View>
        </Section>

        {/* QUICK ACTIONS */}
        <Section>
          <Typography variant="h3" style={styles.sectionTitle}>
            {'Thao tác nhanh'}
          </Typography>
          <View style={styles.actionsGrid}>
            {MENTOR_QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionCard, { backgroundColor: action.bg }]}
                activeOpacity={0.75}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIconBg, { backgroundColor: action.color + '22' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Typography variant="label" style={[styles.actionLabel, { color: action.color }]}>
                  {action.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* TIP CARD */}
        <Section>
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={20} color={theme.colors.warning} />
              <Typography variant="bodyMedium" style={styles.tipTitle}>
                {'Mẹo hôm nay'}
              </Typography>
            </View>
            <Typography variant="body" color="secondary">
              {'Cập nhật hồ sơ thường xuyên giúp bạn xuất hiện cao hơn trong kết quả tìm kiếm và thu hút nhiều học viên hơn.'}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/profile/edit' as any)} style={styles.tipAction}>
              <Typography variant="label" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {'Cập nhật hồ sơ →'}
              </Typography>
            </TouchableOpacity>
          </Card>
        </Section>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT – Chọn màn hình theo role
// ═══════════════════════════════════════════════════════════════
export default function HomeScreen() {
  const userRole = useAuthStore((s) => s.userRole);
  return userRole === 'mentor' ? <MentorHome /> : <BuyerHome />;
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Buyer
  heroIcon: {
    width: 72, height: 72,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 14, elevation: 5,
  },
  heroButton: {
    marginTop: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  highlightIcon: {
    width: 44, height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border.default,
  },

  // Mentor Header
  mentorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: theme.colors.text.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 4,
  },
  mentorHeaderContent: { flex: 1 },
  mentorGreetingLabel: {
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    fontSize: 13,
  },
  mentorGreetingName: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 6,
  },
  mentorGreetingSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  mentorAvatarBtn: { marginLeft: 16 },
  mentorAvatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: theme.colors.primary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    borderLeftWidth: 3,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '900',
    marginBottom: 2,
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionCard: {
    width: '47%',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  actionIconBg: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: {
    fontWeight: '700',
    fontSize: 13,
  },

  // Tip
  tipCard: { gap: 10 },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTitle: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  tipAction: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
