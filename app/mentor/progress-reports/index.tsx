import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProtectedRoute } from '../../../src/components/ProtectedRoute';
import { EmptyState } from '../../../src/components/states/EmptyState';
import { ErrorState } from '../../../src/components/states/ErrorState';
import { LoadingState } from '../../../src/components/states/LoadingState';
import { Typography } from '../../../src/components/typography/Typography';
import { Card } from '../../../src/components/ui/Card';
import { TEXT } from '../../../src/core/constants/strings';
import { progressReportService } from '../../../src/core/services/progressReportService';
import { ProgressReport } from '../../../src/core/types';
import { theme } from '../../../src/theme/theme';

type FilterKey = 'all' | 'pending' | 'reviewed';

function formatRelativeTime(date: Date) {
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 24) return `${Math.max(diffHours, 1)} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function getStatusMeta(status: ProgressReport['status']) {
  if (status === 'reviewed') return { color: theme.colors.success, label: TEXT.PROGRESS_REPORT.STATUS_REVIEWED };
  if (status === 'needs_revision') {
    return { color: theme.colors.warning, label: TEXT.PROGRESS_REPORT.STATUS_NEEDS_REVISION };
  }
  return { color: theme.colors.warning, label: TEXT.PROGRESS_REPORT.STATUS_SUBMITTED };
}

function MentorProgressReportsContent() {
  const router = useRouter();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const loadReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setReports(await progressReportService.getMyReports());
    } catch (loadError: any) {
      setError(loadError?.message || TEXT.PROGRESS_REPORT.LOAD_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    if (activeFilter === 'pending') {
      return reports.filter((report) => report.status === 'submitted');
    }
    if (activeFilter === 'reviewed') {
      return reports.filter((report) => report.status === 'reviewed' || report.status === 'needs_revision');
    }
    return reports;
  }, [activeFilter, reports]);

  if (loading) {
    return <LoadingState message={TEXT.COMMON.LOADING} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadReports()} />;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <Typography style={styles.title} variant="h2">
          {TEXT.PROGRESS_REPORT.LIST_TITLE}
        </Typography>
      </View>

      <View style={styles.filterRow}>
        {[
          { key: 'all' as const, label: TEXT.PROGRESS_REPORT.TAB_ALL },
          { key: 'pending' as const, label: TEXT.PROGRESS_REPORT.TAB_PENDING },
          { key: 'reviewed' as const, label: TEXT.PROGRESS_REPORT.TAB_REVIEWED },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setActiveFilter(item.key)}
            style={[styles.filterButton, activeFilter === item.key && styles.filterButtonActive]}
          >
            <Typography
              style={[styles.filterLabel, activeFilter === item.key && styles.filterLabelActive]}
              variant="caption"
            >
              {item.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        contentContainerStyle={filteredReports.length === 0 ? styles.emptyList : styles.listContent}
        data={filteredReports}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            onRefresh={() => loadReports(true)}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => {
          const status = getStatusMeta(item.status);

          return (
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/mentor/progress-reports/${item.id}` as any)}>
              <Card style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Ionicons color={theme.colors.primary} name="document-text-outline" size={18} />
                  <Typography style={styles.reportTitle} variant="bodyMedium">
                    {item.title}
                  </Typography>
                </View>
                <Typography color="secondary" style={styles.metaText} variant="caption">
                  {`${item.menteeName} • ${formatRelativeTime(item.createdAt)}`}
                </Typography>
                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                  <Typography color="inverse" style={styles.statusText} variant="caption">
                    {status.label}
                  </Typography>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            description={TEXT.PROGRESS_REPORT.EMPTY_STATE}
            fullScreen={false}
            icon="document-text-outline"
            title={TEXT.PROGRESS_REPORT.EMPTY_STATE}
          />
        }
      />
    </SafeAreaView>
  );
}

export default function MentorProgressReportsScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorProgressReportsContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md },
  title: { fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.lg },
  filterButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterLabel: { color: theme.colors.text.secondary, fontWeight: '600' },
  filterLabelActive: { color: theme.colors.text.inverse },
  listContent: { gap: theme.spacing.md, padding: theme.spacing.lg, paddingTop: 0 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  reportCard: { borderRadius: theme.borderRadius.lg, padding: theme.spacing.md },
  reportHeader: { alignItems: 'center', flexDirection: 'row' },
  reportTitle: { flex: 1, fontWeight: '700', marginLeft: theme.spacing.sm },
  metaText: { marginTop: theme.spacing.sm },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusText: { fontWeight: '700' },
});
