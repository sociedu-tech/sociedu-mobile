import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { MentorPackage } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { mentorService } from '../services/mentorService';

function MentorServicesContent() {
  const router = useRouter();
  const [services, setServices] = useState<MentorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await mentorService.getMyServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách gói dịch vụ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    setServices((prev) =>
      prev.map((item) => (item.id === serviceId ? { ...item, isActive: !currentStatus } : item))
    );

    try {
      await mentorService.toggleServiceStatus(serviceId, !currentStatus);
    } catch (err: any) {
      setServices((prev) =>
        prev.map((item) => (item.id === serviceId ? { ...item, isActive: currentStatus } : item))
      );
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái gói dịch vụ.');
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải danh sách gói dịch vụ..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchServices()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          Gói dịch vụ của tôi
        </Typography>
        <TouchableOpacity
          onPress={() => router.push('/mentor/services/form' as any)}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={() => {
          setRefreshing(true);
          fetchServices(true);
        }}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyState
            title="Chưa có gói dịch vụ"
            description="Tạo gói dịch vụ đầu tiên để học viên có thể đặt lịch."
            icon="cube-outline"
            fullScreen={false}
          />
        }
        renderItem={({ item }) => {
          const defaultVersion = item.versions.find((version) => version.isDefault) ?? item.versions[0];

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Typography variant="bodyMedium" style={styles.cardTitle}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {item.description || 'Chưa có mô tả cho gói dịch vụ này.'}
                  </Typography>
                </View>
                <Switch
                  value={item.isActive}
                  onValueChange={() => handleToggleStatus(item.id, item.isActive)}
                  trackColor={{ false: theme.colors.border.default, true: theme.colors.primaryLight }}
                  thumbColor={item.isActive ? theme.colors.primary : '#F4F3F4'}
                />
              </View>

              {defaultVersion ? (
                <View style={styles.metaRow}>
                  <View>
                    <Typography variant="caption" color="secondary">
                      Giá mặc định
                    </Typography>
                    <Typography variant="h3" style={styles.priceText}>
                      ${defaultVersion.price}
                    </Typography>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Typography variant="caption" color="secondary">
                      Thời lượng
                    </Typography>
                    <Typography variant="bodyMedium" style={styles.durationText}>
                      {defaultVersion.duration} phút
                    </Typography>
                  </View>
                </View>
              ) : null}

              <View style={styles.cardActions}>
                <CustomButton
                  label="Sửa gói"
                  variant="outline"
                  onPress={() => router.push(`/mentor/services/form?id=${item.id}` as any)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <CustomButton
          label="Tạo gói dịch vụ mới"
          icon={<Ionicons name="add" size={18} color="#FFF" />}
          onPress={() => router.push('/mentor/services/form' as any)}
        />
      </View>
    </SafeAreaView>
  );
}

export default function MentorServicesScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorServicesContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  iconBtn: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingTop: 12,
  },
  priceText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  durationText: {
    fontWeight: '700',
  },
  cardActions: {
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
});
