import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Switch, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../../src/components/typography/Typography';
import { CustomButton } from '../../../src/components/button/CustomButton';
import { theme } from '../../../src/theme/theme';
import { TEXT } from '../../../src/core/constants/strings';
import { mentorService } from '../../../src/core/services/mentorService';
import { MentorPackage } from '../../../src/core/types';

// Mock Skeleton Component (Simplified for inline usage, should ideally be in components/states)
const SkeletonCard = () => (
  <View style={[styles.card, styles.skeletonCard]}>
    <View style={styles.skeletonTextLg} />
    <View style={styles.skeletonTextSm} />
    <View style={styles.skeletonTextSm} />
  </View>
);

export default function MentorServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<MentorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mentorService.getMyServices();
      setServices(data);
    } catch (err: any) {
      // 404/403 → mentor chưa có gói nào, hiện danh sách rỗng
      const statusCode = err?.statusCode;
      if (statusCode === 404 || statusCode === 403) {
        setServices([]);
      } else {
        setError(err.message || TEXT.COMMON.ERROR);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleToggleStatus = async (pkgId: string, currentStatus: boolean) => {
    // 1. Optimistic Update (Cập nhật UI ngay lập tức)
    setServices((prev) => 
      prev.map(p => p.id === pkgId ? { ...p, isActive: !currentStatus } : p)
    );

    try {
      // 2. Call API
      const updated = await mentorService.toggleServiceStatus(pkgId);
      setServices((prev) => prev.map((p) => (p.id === pkgId ? updated : p)));
      // Optional: Hiện toast success
    } catch (err: any) {
      // 3. Rollback nếu lỗi
      setServices((prev) => 
        prev.map(p => p.id === pkgId ? { ...p, isActive: currentStatus } : p)
      );
      Alert.alert(TEXT.COMMON.ERROR, err.message || TEXT.COMMON.ERROR);
    }
  };

  const renderItem = ({ item }: { item: MentorPackage }) => {
    const baseVersion = item.versions.find(v => v.isDefault) || item.versions[0];
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Typography variant="bodyMedium" style={styles.title}>{item.title}</Typography>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleStatus(item.id, item.isActive)}
            trackColor={{ false: theme.colors.border.default, true: theme.colors.primaryLight }}
            thumbColor={item.isActive ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
        <Typography variant="caption" color="secondary" style={styles.desc} numberOfLines={2}>
          {item.description}
        </Typography>
        {baseVersion && (
          <View style={styles.priceRow}>
            <Typography variant="bodyMedium" style={styles.price}>
              ${baseVersion.price}
            </Typography>
            <Typography variant="caption" color="secondary">
              {' • '} {baseVersion.duration} phút
            </Typography>
          </View>
        )}
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => router.push(`/mentor/services/form?id=${item.id}` as any)}
        >
          <Typography variant="label" style={{ color: theme.colors.primary }}>Sửa gói dịch vụ</Typography>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>{TEXT.SERVICE.LIST_TITLE}</Typography>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Typography variant="body" color="error">{error}</Typography>
          <CustomButton label={TEXT.COMMON.RETRY} onPress={fetchServices} variant="outline" style={{ marginTop: 16 }} />
        </View>
      ) : loading ? (
        <View style={styles.listContainer}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={theme.colors.border.default} style={{ marginBottom: 16 }} />
              <Typography variant="bodyMedium" color="secondary" align="center">
                {TEXT.SERVICE.EMPTY_STATE}
              </Typography>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      {!loading && !error && (
        <View style={styles.footer}>
          <CustomButton 
            label={TEXT.SERVICE.CREATE_NEW}
            icon={<Ionicons name="add" size={20} color="#FFF" />}
            onPress={() => router.push('/mentor/services/form' as any)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  listContainer: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { fontWeight: '700', flex: 1, marginRight: 16 },
  desc: { marginBottom: 12, lineHeight: 20 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  price: { fontWeight: '800', color: theme.colors.primary },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primaryLight + '20',
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  // Skeletons
  skeletonCard: { opacity: 0.7 },
  skeletonTextLg: { width: '60%', height: 24, backgroundColor: theme.colors.border.default, borderRadius: 4, marginBottom: 12 },
  skeletonTextSm: { width: '100%', height: 16, backgroundColor: theme.colors.border.default, borderRadius: 4, marginBottom: 8 },
});
