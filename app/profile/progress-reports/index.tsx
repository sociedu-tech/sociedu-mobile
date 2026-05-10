import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../../src/components/typography/Typography';
import { LoadingState } from '../../../src/components/states/LoadingState';
import { ErrorState } from '../../../src/components/states/ErrorState';
import { theme } from '../../../src/theme/theme';
import { TEXT } from '../../../src/core/constants/strings';
import { progressReportService } from '../../../src/core/services/progressReportService';
import { ProgressReport } from '../../../src/core/types';

export default function MenteeProgressReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await progressReportService.getMenteeReports();
      setReports(data);
    } catch (err: any) {
      setError(err?.message || TEXT.PROGRESS_REPORT.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const getStatusColor = (status: ProgressReport['status']) => {
    switch (status) {
      case 'reviewed':
        return theme.colors.success;
      case 'needs_revision':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const renderItem = ({ item }: { item: ProgressReport }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/mentor/progress-reports/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Typography variant="bodyMedium" style={styles.title}>
          {item.title}
        </Typography>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Typography variant="caption" style={{ color: getStatusColor(item.status), fontWeight: '700' }}>
            {item.status.toUpperCase()}
          </Typography>
        </View>
      </View>
      
      <Typography variant="caption" color="secondary" numberOfLines={2} style={styles.content}>
        {item.content}
      </Typography>

      <View style={styles.cardFooter}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
          <Typography variant="caption" color="secondary" style={styles.metaText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Typography>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.text.disabled} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.PROGRESS_REPORT.LIST_TITLE}
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchReports}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={64} color={theme.colors.text.disabled} />
              <Typography variant="body" color="secondary" style={{ marginTop: 16 }}>
                {TEXT.PROGRESS_REPORT.EMPTY_STATE}
              </Typography>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontWeight: '700' },
  list: { padding: 20 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  content: { marginBottom: 12, lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  meta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 6 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
});
