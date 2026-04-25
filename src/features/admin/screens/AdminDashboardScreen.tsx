import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Card } from '@/src/components/ui/Card';
import { theme } from '@/src/theme/theme';

import {
  adminService,
  AuditLogItem,
  MentorModerationItem,
} from '../services/adminService';

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminContent() {
  const [queue, setQueue] = useState<MentorModerationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    setError(null);

    try {
      const [nextQueue, nextAuditLogs] = await Promise.all([
        adminService.getMentorModerationQueue(),
        adminService.getAuditLogs(),
      ]);
      setQueue(nextQueue);
      setAuditLogs(nextAuditLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const approve = async (item: MentorModerationItem) => {
    setBusyId(item.id);
    try {
      await adminService.approveMentor(item.id);
      await loadData(true);
    } catch (err) {
      Alert.alert('Không thể duyệt mentor', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (item: MentorModerationItem) => {
    setBusyId(item.id);
    try {
      await adminService.rejectMentor(item.id, 'Profile chưa đủ điều kiện xác minh.');
      await loadData(true);
    } catch (err) {
      Alert.alert('Không thể từ chối mentor', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải bảng quản trị..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadData()} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="h2" style={styles.title}>
                  Quản trị
                </Typography>
                <Typography variant="body" color="secondary">
                  Duyệt mentor và theo dõi thao tác bảo mật.
                </Typography>
              </View>
            </View>

            <Typography variant="h3" style={styles.sectionTitle}>
              Mentor chờ duyệt
            </Typography>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Không có mentor chờ duyệt"
            description="Các hồ sơ mới sẽ xuất hiện tại đây."
            icon="shield-checkmark-outline"
            fullScreen={false}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Typography variant="bodyMedium" style={styles.cardTitle}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.email}
            </Typography>
            <Typography variant="body" style={styles.headline}>
              {item.headline}
            </Typography>
            <Typography variant="caption" color="secondary">
              {item.expertise.join(', ')} - Gửi lúc {formatDate(item.submittedAt)}
            </Typography>
            <View style={styles.actions}>
              <CustomButton
                label="Từ chối"
                variant="outline"
                onPress={() => reject(item)}
                disabled={busyId === item.id}
                style={styles.actionButton}
              />
              <CustomButton
                label="Duyệt"
                onPress={() => approve(item)}
                loading={busyId === item.id}
                disabled={busyId === item.id}
                style={styles.actionButton}
              />
            </View>
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.auditSection}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Audit log
            </Typography>
            {auditLogs.length === 0 ? (
              <Typography variant="body" color="secondary">
                Chưa có log thao tác hoặc backend chưa cung cấp endpoint audit.
              </Typography>
            ) : (
              auditLogs.map((log) => (
                <View key={log.id} style={styles.auditRow}>
                  <Typography variant="bodyMedium">{log.action}</Typography>
                  <Typography variant="caption" color="secondary">
                    {log.actorName} - {log.targetName} - {formatDate(log.createdAt)}
                  </Typography>
                </View>
              ))
            )}
          </View>
        }
      />
    </View>
  );
}

export default function AdminDashboardScreen() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  title: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontWeight: '800',
  },
  headline: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  auditSection: {
    marginTop: theme.spacing.lg,
  },
  auditRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
});
