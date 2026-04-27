import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section } from '@/src/components/ui/Section';
import { TEXT } from '@/src/core/constants/strings';
import { ProgressReport, ProgressReportStatus } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { progressService } from '../services/progressService';

function getStatusConfig(status: ProgressReportStatus) {
  switch (status) {
    case 'reviewed':
      return { label: TEXT.PROGRESS.STATUS_REVIEWED, color: theme.colors.success };
    case 'submitted':
      return { label: TEXT.PROGRESS.STATUS_SUBMITTED, color: theme.colors.info };
    default:
      return { label: TEXT.PROGRESS.STATUS_DRAFT, color: theme.colors.warning };
  }
}

export default function ProgressReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) {
      setError('Thiếu mã báo cáo.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await progressService.getById(id);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.PROGRESS.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return <LoadingState message="Đang tải chi tiết tiến độ..." />;
  }

  if (error || !report) {
    return <ErrorState error={error || 'Không tìm thấy báo cáo.'} onRetry={fetchReport} />;
  }

  const statusConfig = getStatusConfig(report.status);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.PROGRESS.DETAIL_TITLE}
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Section>
          <View style={styles.titleRow}>
            <Typography variant="h2" style={styles.reportTitle}>
              {report.title}
            </Typography>
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
              <Typography variant="caption" style={{ color: statusConfig.color, fontWeight: '700' }}>
                {statusConfig.label}
              </Typography>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
            <Typography variant="caption" color="secondary" style={{ marginLeft: 6 }}>
              {new Date(report.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Typography>
          </View>
        </Section>

        <Section>
          <Card style={styles.contentCard}>
            <Typography variant="body" style={{ lineHeight: 24 }}>
              {report.content}
            </Typography>
          </Card>
        </Section>

        <Section>
          <Typography variant="h3" style={styles.sectionTitle}>
            {TEXT.PROGRESS.MENTOR_FEEDBACK}
          </Typography>

          {report.mentorFeedback ? (
            <Card style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
                </View>
                <Typography variant="label" style={{ fontWeight: '700' }}>
                  Mentor
                </Typography>
              </View>
              <Typography variant="body" style={{ marginTop: theme.spacing.sm, lineHeight: 22 }}>
                {report.mentorFeedback}
              </Typography>
            </Card>
          ) : (
            <Card style={styles.noFeedbackCard}>
              <Ionicons name="time-outline" size={24} color={theme.colors.text.disabled} />
              <Typography variant="body" color="disabled" style={{ marginTop: theme.spacing.sm }}>
                {TEXT.PROGRESS.NO_FEEDBACK}
              </Typography>
            </Card>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: { padding: theme.spacing.sm, marginLeft: -theme.spacing.sm },
  headerTitle: { fontWeight: '700' },
  scroll: { paddingBottom: theme.spacing.xxl },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportTitle: { fontWeight: '800', flex: 1, marginRight: theme.spacing.sm },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  contentCard: { padding: theme.spacing.md },
  sectionTitle: { fontWeight: '700', marginBottom: theme.spacing.md },
  feedbackCard: { padding: theme.spacing.md },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  noFeedbackCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
});
