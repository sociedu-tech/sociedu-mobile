import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';

/**
 * HomeScreen – tương đương "/" trên web (HomePage).
 *
 * Web structure:
 *   <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
 *     <h1> Tìm kiếm <span>Mentor</span> hoàn hảo cho bạn </h1>
 *     <p> Kết nối với ... </p>
 *     <Link to="/mentors"> Khám phá Mentor </Link>
 *   </motion.div>
 */

// ─── Highlights (mở rộng cho mobile, web chỉ có hero) ────────
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

export default function HomeScreen() {
  const router = useRouter();

  // ─── Animation (mirror web motion initial/animate) ─────────
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════ HERO (= web HomePage core) ═══════════════ */}
        <Animated.View
          style={[styles.hero, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={36} color={theme.colors.primary} />
          </View>

          {/* h1: "Tìm kiếm Mentor hoàn hảo cho bạn" */}
          <Typography variant="h1" align="center" style={styles.heroTitle}>
            {'Tìm kiếm '}
            <Typography variant="h1" style={styles.heroAccent}>Mentor</Typography>
            {'\nhoàn hảo cho bạn'}
          </Typography>

          {/* p: subtitle */}
          <Typography variant="body" color="secondary" align="center" style={styles.heroSub}>
            Kết nối với những người đi trước giàu kinh nghiệm để nhận được lời khuyên, định hướng và học hỏi.
          </Typography>

          {/* CTA: "Khám phá Mentor" → /mentors */}
          <CustomButton
            label="Khám phá Mentor"
            variant="primary"
            size="lg"
            icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
            onPress={() => router.push('/(tabs)/mentor' as any)}
            style={styles.ctaBtn}
          />
        </Animated.View>

        {/* ═══════════════ HIGHLIGHTS ═══════════════ */}
        <View style={styles.highlightsSection}>
          <Typography variant="h3" align="center" style={styles.sectionTitle}>
            Tại sao chọn UniShare?
          </Typography>

          {HIGHLIGHTS.map((item) => (
            <View key={item.title} style={styles.highlightCard}>
              <View style={[styles.highlightIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.highlightContent}>
                <Typography variant="bodyMedium" style={styles.highlightTitle}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {item.desc}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* ═══════════════ STATS ═══════════════ */}
        <View style={styles.statsRow}>
          {[
            { val: '500+', label: 'Mentor' },
            { val: '2K+', label: 'Buổi học' },
            { val: '4.8', label: 'Đánh giá' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.statsItem}>
                <Typography variant="h2" style={styles.statsValue}>{s.val}</Typography>
                <Typography variant="caption" color="secondary">{s.label}</Typography>
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingBottom: 32,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: theme.spacing.lg,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: theme.colors.text.primary,
  },
  heroAccent: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 30,
  },
  heroSub: {
    marginTop: 12,
    paddingHorizontal: 8,
    lineHeight: 24,
  },
  ctaBtn: {
    marginTop: 28,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 32,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },

  // ── Highlights ──
  highlightsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 14,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statsDivider: {
    width: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: 4,
  },
});