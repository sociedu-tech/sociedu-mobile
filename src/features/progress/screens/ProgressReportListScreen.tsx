import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { TEXT } from '@/src/core/constants/strings';
import { ProgressReport, ProgressReportStatus } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { progressService } from '../services/progressService';

function getStatusConfig(status: ProgressReportStatus) {
  switch (status) {
    case 'reviewed':
      return { label: TEXT.PROGRESS.STATUS_REVIEWED, color: theme.colors.success, icon: 'checkmark-circle' as const };
    case 'submitted':
      return { label: TEXT.PROGRESS.STATUS_SUBMITTED, color: theme.colors.info, icon: 'send' as const };
    default:
      return { label: TEXT.PROGRESS.STATUS_DRAFT, color: theme.colors.warning, icon: 'create' as const };
  }
}

export default function ProgressReportListScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await progressService.getMyReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.PROGRESS.LOAD_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && reports.length === 0) {
    return <LoadingState message="Đang tải tiến độ học tập..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadData()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.PROGRESS.LIST_TITLE}
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData(true);
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={TEXT.PROGRESS.EMPTY}
            description="Các báo cáo tiến độ sẽ xuất hiện khi bạn hoàn thành buổi học."
            icon="trending-up-outline"
            fullScreen={false}
          />
        }
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/progress/${item.id}` as any)}
            >
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                    <Typography variant="bodyMedium" style={styles.cardTitle}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ marginTop: 4 }}>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
                    <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                    <Typography
                      variant="caption"
                      style={{ color: statusConfig.color, fontWeight: '700', marginLeft: 4 }}
                    >
                      {statusConfig.label}
                    </Typography>
                  </View>
                </View>

                <Typography variant="body" color="secondary" numberOfLines={2} style={{ marginTop: theme.spacing.sm }}>
                  {item.content}
                </Typography>

                {item.mentorFeedback ? (
                  <View style={styles.feedbackPreview}>
                    <Ionicons name="chatbubble-outline" size={14} color={theme.colors.primary} />
                    <Typography
                      variant="caption"
                      color="secondary"
                      numberOfLines={1}
                      style={{ marginLeft: 6, flex: 1 }}
                    >
                      {item.mentorFeedback}
                    </Typography>
                  </View>
                ) : null}
              </Card>
            </TouchableOpacity>
          );
        }}
      />
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
  listContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  card: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  feedbackPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
});
