import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section } from '@/src/components/ui/Section';
import { theme } from '@/src/theme/theme';

const ITEMS = [
  {
    title: 'Khám phá mentor phù hợp',
    description: 'Tìm kiếm theo chuyên môn, giá, thời lượng và kinh nghiệm thực tế.',
  },
  {
    title: 'So sánh các gói học',
    description: 'Xem rõ lộ trình, mức giá và khung giờ trống trước khi thanh toán.',
  },
  {
    title: 'Theo dõi lịch hẹn',
    description: 'Quản lý phiên học, link meeting và trạng thái thanh toán tại một nơi.',
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
        <Section>
          <Typography variant="h1" style={{ fontWeight: '900', marginBottom: theme.spacing.sm }}>
            Explore
          </Typography>
          <Typography variant="body" color="secondary">
            Khu vực này giữ route tương thích với `tpda-map` và tóm tắt nhanh các luồng chính của app.
          </Typography>
        </Section>

        <Section>
          {ITEMS.map((item) => (
            <Card key={item.title} style={{ marginBottom: theme.spacing.md }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 6 }}>
                {item.title}
              </Typography>
              <Typography variant="body" color="secondary">
                {item.description}
              </Typography>
            </Card>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
