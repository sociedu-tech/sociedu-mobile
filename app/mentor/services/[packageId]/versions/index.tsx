import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../../../../src/components/typography/Typography';
import { CustomButton } from '../../../../../src/components/button/CustomButton';
import { TEXT } from '../../../../../src/core/constants/strings';
import { mentorService } from '../../../../../src/core/services/mentorService';
import { MentorPackage, MentorPackageVersion } from '../../../../../src/core/types';
import { theme } from '../../../../../src/theme/theme';

export default function PackageVersionsScreen() {
  const router = useRouter();
  const { packageId } = useLocalSearchParams<{ packageId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pkg, setPkg] = useState<MentorPackage | null>(null);

  const loadPackage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mentorService.getMyPackageById(packageId);
      setPkg(data);
    } catch (err: any) {
      setError(err?.message || TEXT.SERVICE_VERSION.LOAD_VERSIONS_ERROR);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    void loadPackage();
  }, [loadPackage]);

  const renderBadge = (label: string, color: string, backgroundColor: string) => (
    <View style={[styles.badge, { backgroundColor }]}>
      <Typography variant="caption" style={{ color, fontWeight: '700' }}>
        {label}
      </Typography>
    </View>
  );

  const renderItem = ({ item }: { item: MentorPackageVersion }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Typography variant="bodyMedium" style={styles.versionTitle}>
          {TEXT.SERVICE_VERSION.VERSION_LABEL} {item.id}
        </Typography>
        <TouchableOpacity
          onPress={() => router.push(`/mentor/services/${packageId}/versions/${item.id}` as any)}
            style={styles.editAction}
          >
            <Typography variant="label" style={styles.editActionText}>
              Quản lý giáo trình
            </Typography>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.badgeRow}>
        {item.isDefault ? renderBadge(TEXT.SERVICE_VERSION.BADGE_DEFAULT, theme.colors.primary, theme.colors.primaryLight) : null}
        {item.isActive
          ? renderBadge(TEXT.SERVICE_VERSION.BADGE_ACTIVE, theme.colors.success, '#ECFDF5')
          : renderBadge(TEXT.SERVICE_VERSION.BADGE_INACTIVE, theme.colors.text.secondary, '#F3F4F6')}
      </View>

      <Typography variant="body" color="secondary" style={styles.metaText}>
        Giá: {item.price} VNĐ • Thời lượng: {item.duration} phút • Giáo trình: {item.curriculums.length} mục
      </Typography>
      <Typography variant="caption" color="secondary" style={styles.metaText}>
        {TEXT.SERVICE_VERSION.DELIVERY_TYPE}: {item.deliveryType}
      </Typography>

      <View style={styles.warningBox}>
        <Typography variant="caption" style={styles.warningText}>
          Phiên này đang dùng contract backend thật: có thể xem chi tiết và quản lý giáo trình, còn đặt mặc định hoặc xóa phiên bản sẽ được bổ sung sau.
        </Typography>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.SERVICE_VERSION.VERSIONS_SCREEN_TITLE}
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Typography variant="body" color="secondary">
            {TEXT.COMMON.LOADING}
          </Typography>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Typography variant="body" color="error">
            {error}
          </Typography>
          <CustomButton label={TEXT.COMMON.RETRY} variant="outline" onPress={() => void loadPackage()} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <FlatList
          data={pkg?.versions ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <Typography variant="h3">{pkg?.title}</Typography>
              <Typography variant="body" color="secondary" style={styles.summaryText}>
                {pkg?.description || TEXT.SERVICE_VERSION.NO_DESCRIPTION}
              </Typography>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={56} color={theme.colors.border.default} />
              <Typography variant="bodyMedium" color="secondary" align="center" style={{ marginTop: 12 }}>
                {TEXT.SERVICE_VERSION.EMPTY_VERSIONS}
              </Typography>
            </View>
          }
        />
      )}

      {!loading && !error ? (
        <View style={styles.footer}>
          <CustomButton
            label={TEXT.SERVICE_VERSION.ADD_VERSION}
            icon={<Ionicons name="add" size={20} color="#FFF" />}
            onPress={() => router.push(`/mentor/services/${packageId}/versions/new` as any)}
          />
        </View>
      ) : null}
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
  headerTitle: { fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { padding: 20, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryText: { marginTop: 8, lineHeight: 22 },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionTitle: { fontWeight: '700' },
  editAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editActionText: {
    color: theme.colors.primary,
    fontWeight: '700',
    marginRight: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  metaText: { marginTop: 4 },
  warningBox: {
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
  },
  warningText: {
    color: theme.colors.warning,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
});
