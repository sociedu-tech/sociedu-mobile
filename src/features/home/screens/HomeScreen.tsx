import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section } from '@/src/components/ui/Section';
import { TEXT } from '@/src/core/constants/strings';
import { theme } from '@/src/theme/theme';

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
    desc: 'Mỗi mentor đều được hệ thống xác minh năng lực.',
    color: theme.colors.info,
    bg: '#DBEAFE',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
        <Section>
          <Animated.View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 28 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: theme.borderRadius.xl,
                backgroundColor: theme.colors.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 14,
                elevation: 5,
              }}
            >
              <Ionicons name="school" size={36} color={theme.colors.primary} />
            </View>
            <Typography variant="h1" align="center">
              {TEXT.HOME.HERO_TITLE_PREFIX}
              <Typography variant="h1" style={{ color: theme.colors.primary, fontWeight: '900' }}>
                {TEXT.HOME.HERO_TITLE_HIGHLIGHT}
              </Typography>
              {TEXT.HOME.HERO_TITLE_SUFFIX}
            </Typography>
            <Typography variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.md }}>
              {TEXT.HOME.HERO_SUBTITLE}
            </Typography>
            <CustomButton
              label={TEXT.HOME.HERO_CTA}
              variant="primary"
              size="lg"
              icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
              onPress={() => router.push('/(tabs)/mentor' as any)}
              style={{
                marginTop: theme.spacing.xl,
                borderRadius: theme.borderRadius.full,
                paddingHorizontal: theme.spacing.xl,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 14,
                elevation: 6,
              }}
            />
          </Animated.View>
        </Section>

        <Section>
          <Typography
            variant="h3"
            align="center"
            style={{ fontWeight: '700', color: theme.colors.text.primary, marginBottom: theme.spacing.lg }}
          >
            {TEXT.HOME.WHY_US}
          </Typography>
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.borderRadius.lg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.md,
                  backgroundColor: item.bg,
                }}
              >
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
