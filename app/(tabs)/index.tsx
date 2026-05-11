import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { Section } from '../../src/components/ui/Section';
import { useAuthStore } from '../../src/core/store/authStore';
import { useBookingStore } from '../../src/core/store/bookingStore';

const { width } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════
//  DỮ LIỆU TĨNH
// ═══════════════════════════════════════════════════════════════
const HIGHLIGHTS = [
  {
    icon: 'people' as const,
    title: 'Mentor chất lượng',
    desc: 'Kết nối với sinh viên xuất sắc và chuyên gia trong ngành.',
    color: theme.colors.primary,
    bg: theme.colors.primarySoft,
  },
  {
    icon: 'chatbubbles' as const,
    title: 'Tư vấn 1-1',
    desc: 'Đặt lịch hẹn và nhận tư vấn trực tiếp với mentor.',
    color: theme.colors.success,
    bg: '#ECFDF5',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Đã xác minh',
    desc: 'Mọi mentor đều được hệ thống xác minh năng lực.',
    color: theme.colors.info,
    bg: '#EFF6FF',
  },
];

const MENTOR_QUICK_ACTIONS = [
  {
    icon: 'calendar' as const,
    label: 'Lịch hẹn',
    route: '/(tabs)/bookings',
    color: theme.colors.primary,
    bg: theme.colors.primarySoft,
  },
  {
    icon: 'chatbubbles' as const,
    label: 'Tin nhắn',
    route: '/(tabs)/messages',
    color: theme.colors.success,
    bg: '#ECFDF5',
  },
  {
    icon: 'person' as const,
    label: 'Hồ sơ',
    route: '/(tabs)/profile',
    color: theme.colors.info,
    bg: '#EFF6FF',
  },
  {
    icon: 'cube' as const,
    label: 'Dịch vụ',
    route: '/mentor/services',
    color: theme.colors.warning,
    bg: '#FFFBEB',
  },
];

// ═══════════════════════════════════════════════════════════════
//  BUYER HOME – Landing page giới thiệu
// ═══════════════════════════════════════════════════════════════
function BuyerHome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION WITH GRADIENT BACKGROUND */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
          <LinearGradient
            colors={['#EEF2FF', '#FFFFFF']}
            style={styles.heroContainer}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconBadge}>
                <Ionicons name="school" size={32} color={theme.colors.primary} />
              </View>
              <Typography variant="h1" align="center" style={styles.heroTitle}>
                {'Nâng tầm kiến thức\ncùng '}
                <Typography variant="h1" style={{ color: theme.colors.primary, fontWeight: '900' }}>UniShare</Typography>
              </Typography>
              <Typography variant="body" color="secondary" align="center" style={styles.heroSubtitle}>
                {'Kết nối trực tiếp với các Mentor hàng đầu để bứt phá giới hạn bản thân.'}
              </Typography>
              <CustomButton
                label="Khám phá ngay"
                variant="gradient"
                size="lg"
                icon={<Ionicons name="rocket" size={20} color="#FFF" />}
                onPress={() => router.push('/(tabs)/mentor' as any)}
                style={styles.heroButton}
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* STATS SECTION */}
        <Section style={{ marginTop: -40 }}>
          <Card variant="premium" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Typography variant="h3" style={styles.statValue}>{'500+'}</Typography>
                <Typography variant="caption" color="muted" style={styles.statLabel}>{'Mentor'}</Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Typography variant="h3" style={styles.statValue}>{'2K+'}</Typography>
                <Typography variant="caption" color="muted" style={styles.statLabel}>{'Buổi học'}</Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Typography variant="h3" style={styles.statValue}>{'4.9'}</Typography>
                <Typography variant="caption" color="muted" style={styles.statLabel}>{'Đánh giá'}</Typography>
              </View>
            </View>
          </Card>
        </Section>

        {/* HIGHLIGHTS */}
        <Section style={{ marginTop: theme.spacing.lg }}>
          <Typography variant="h3" style={styles.sectionTitle}>
            {'Giá trị vượt trội'}
          </Typography>
          {HIGHLIGHTS.map((item, index) => (
            <Animated.View 
              key={item.title}
              style={{ 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }]
              }}
            >
              <Card style={styles.highlightCard}>
                <View style={[styles.highlightIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 2 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ lineHeight: 18 }}>{item.desc}</Typography>
                </View>
              </Card>
            </Animated.View>
          ))}
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
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const upcomingCount = bookings.filter((b) => ['active', 'pending', 'confirmed'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Mentor';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PREMIUM GREETING HEADER */}
        <LinearGradient
          colors={[theme.colors.text.primary, '#1E293B']}
          style={styles.mentorHeader}
        >
          <View style={styles.mentorHeaderContent}>
            <Typography variant="caption" style={styles.mentorGreetingLabel}>
              {'Chào buổi sáng 👋'}
            </Typography>
            <Typography variant="h2" style={styles.mentorGreetingName}>
              {displayName}
            </Typography>
            <View style={styles.mentorStatusBadge}>
              <View style={styles.statusDot} />
              <Typography variant="caption" style={{ color: '#A5B4FC', fontWeight: '700' }}>
                {'SẴN SÀNG TƯ VẤN'}
              </Typography>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile' as any)}
            activeOpacity={0.8}
            style={styles.mentorAvatarWrapper}
          >
            <View style={styles.mentorAvatarCircle}>
              <Typography variant="h3" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                {displayName.charAt(0).toUpperCase()}
              </Typography>
            </View>
            <View style={styles.avatarActiveIndicator} />
          </TouchableOpacity>
        </LinearGradient>

        {/* OVERVIEW STATS */}
        <Section style={{ marginTop: -30 }}>
          <View style={styles.statsRowMentor}>
            <Card variant="premium" style={[styles.statCardMentor, { borderTopColor: theme.colors.primary, borderTopWidth: 4 }]}>
              <Typography variant="h2" style={{ color: theme.colors.primary, fontWeight: '900' }}>{upcomingCount}</Typography>
              <Typography variant="caption" color="muted">{'Sắp tới'}</Typography>
            </Card>
            <Card variant="premium" style={[styles.statCardMentor, { borderTopColor: theme.colors.success, borderTopWidth: 4 }]}>
              <Typography variant="h2" style={{ color: theme.colors.success, fontWeight: '900' }}>{completedCount}</Typography>
              <Typography variant="caption" color="muted">{'Đã xong'}</Typography>
            </Card>
            <Card variant="premium" style={[styles.statCardMentor, { borderTopColor: theme.colors.warning, borderTopWidth: 4 }]}>
              <Typography variant="h2" style={{ color: theme.colors.warning, fontWeight: '900' }}>{'4.9'}</Typography>
              <Typography variant="caption" color="muted">{'Rating'}</Typography>
            </Card>
          </View>
        </Section>

        {/* QUICK ACTIONS GRID */}
        <Section style={{ marginTop: theme.spacing.lg }}>
          <View style={{ marginBottom: 16 }}>
            <Typography variant="h3" style={{ fontWeight: '800' }}>
              {'Thao tác nhanh'}
            </Typography>
          </View>
          <View style={styles.actionsGrid}>
            {MENTOR_QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIconBg, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Typography variant="label" style={{ color: theme.colors.text.primary, marginTop: 4 }}>
                  {action.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </Section>


      </Animated.ScrollView>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const activeMode = useAuthStore((s) => s.activeMode);
  return activeMode === 'mentor' ? <MentorHome /> : <BuyerHome />;
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Buyer Styles
  heroContainer: {
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconBadge: {
    width: 64, height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.soft,
  },
  heroTitle: {
    marginBottom: 12,
    color: theme.colors.text.primary,
  },
  heroSubtitle: {
    maxWidth: '80%',
    marginBottom: 24,
    lineHeight: 22,
  },
  heroButton: {
    width: width * 0.6,
    borderRadius: 30,
  },
  statsCard: {
    marginHorizontal: theme.spacing.lg,
    paddingVertical: 20,
    borderRadius: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1, height: 30,
    backgroundColor: theme.colors.border.light,
  },
  sectionTitle: {
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: '800',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    gap: 16,
    borderRadius: 20,
  },
  highlightIcon: {
    width: 48, height: 48,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },

  // Mentor Styles
  mentorHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 30,
    paddingBottom: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mentorHeaderContent: { flex: 1 },
  mentorGreetingLabel: { color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  mentorGreetingName: { color: '#FFF', fontWeight: '900', fontSize: 28, marginBottom: 8 },
  mentorStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  mentorAvatarWrapper: { position: 'relative' },
  mentorAvatarCircle: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: theme.colors.primary,
  },
  avatarActiveIndicator: {
    position: 'absolute',
    bottom: 2, right: 2,
    width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2, borderColor: '#1E293B',
  },
  statsRowMentor: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: 12,
  },
  statCardMentor: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  actionCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  actionIconBg: {
    width: 56, height: 56,
    borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  tipCardGradient: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  tipIconBackground: {
    position: 'absolute',
    right: -10, bottom: -10,
    opacity: 0.2,
  }
});
