import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useBreakpoint } from '../../src/theme/useBreakpoint';
import { Card } from '../../src/components/ui/Card';
import { Section } from '../../src/components/ui/Section';

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
  const breakpoint = useBreakpoint();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <Section>
          <Animated.View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 28 }}>
            <View style={{
              width: 72, height: 72, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.primaryLight,
              justifyContent: 'center', alignItems: 'center', marginBottom: 24,
              shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 5,
            }}>
              <Ionicons name="school" size={36} color={theme.colors.primary} />
            </View>
            <Typography variant="h1" align="center">
              {'Tìm kiếm '}
              <Typography variant="h1" style={{ color: theme.colors.primary, fontWeight: '900' }}>Mentor</Typography>
              {'\nhoàn hảo cho bạn'}
            </Typography>
            <Typography variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.md }}>
              Kết nối với những người đi trước giàu kinh nghiệm để nhận được lời khuyên, định hướng và học hỏi.
            </Typography>
            <CustomButton
              label="Khám phá Mentor"
              variant="primary"
              size="lg"
              icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
              onPress={() => router.push('/(tabs)/mentor' as any)}
              style={{ marginTop: theme.spacing.xl, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.xl, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 6 }}
            />
          </Animated.View>
        </Section>
        {/* HIGHLIGHTS */}
        <Section>
          <Typography variant="h3" align="center" style={{ fontWeight: '700', color: theme.colors.text.primary, marginBottom: theme.spacing.lg }}>
            Tại sao chọn UniShare?
          </Typography>
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <View style={{ width: 44, height: 44, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md, backgroundColor: item.bg }}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.text.primary, marginBottom: 2 }}>{item.title}</Typography>
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
                <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.primary, marginBottom: 2 }}>500+</Typography>
                <Typography variant="caption" color="secondary">Mentor</Typography>
              </View>
              <View style={{ width: 1, backgroundColor: theme.colors.border.default, marginVertical: 4 }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.primary, marginBottom: 2 }}>2K+</Typography>
                <Typography variant="caption" color="secondary">Buổi học</Typography>
              </View>
              <View style={{ width: 1, backgroundColor: theme.colors.border.default, marginVertical: 4 }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.primary, marginBottom: 2 }}>4.8</Typography>
                <Typography variant="caption" color="secondary">Đánh giá</Typography>
              </View>
            </View>
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

