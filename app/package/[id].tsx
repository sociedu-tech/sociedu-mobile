import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../src/components/button/CustomButton';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { toPackage } from '../../src/core/adapters/mentorAdapter';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { useAuthStore } from '../../src/core/store/authStore';
import { MentorPackage, MentorPackageVersion } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

export default function PackageDetailScreen() {
  const { id, mentorId, versionId } = useLocalSearchParams<{
    id: string;
    mentorId: string;
    versionId?: string;
  }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [selectedVer, setSelectedVer] = useState<MentorPackageVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchPackage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!id || !mentorId) {
        throw new Error(TEXT.PACKAGE_DETAIL.NOT_FOUND);
      }

      const packages = await mentorService.getPackages(mentorId);
      const found = packages.find((item) => String(item.id) === id);

      if (!found) {
        throw new Error(TEXT.PACKAGE_DETAIL.NOT_FOUND);
      }

      const uiPkg = toPackage(found);
      setPkg(uiPkg);

      // Ưu tiên chọn version từ params, nếu không thì chọn bản mặc định hoặc bản đầu tiên
      let initialVer = uiPkg.versions.find((v) => String(v.id) === versionId);
      if (!initialVer) {
        initialVer = uiPkg.versions.find((v) => v.isDefault) || uiPkg.versions[0];
      }
      setSelectedVer(initialVer ?? null);
    } catch (err: any) {
      setError(err?.message || TEXT.PACKAGE_DETAIL.NOT_FOUND);
    } finally {
      setLoading(false);
    }
  }, [id, mentorId, versionId]);

  useEffect(() => {
    void fetchPackage();
  }, [fetchPackage]);

  const handleCheckout = () => {
    if (!selectedVer || !pkg) return;

    if (!isAuthenticated) {
      Alert.alert(TEXT.PACKAGE_DETAIL.ERROR_TITLE, TEXT.PACKAGE_DETAIL.LOGIN_REQUIRED, [
        {
          text: TEXT.COMMON.CONFIRM,
          onPress: () => router.push('/(auth)/login'),
        },
        {
          text: TEXT.COMMON.CANCEL,
          style: 'cancel',
        },
      ]);
      return;
    }

    router.push({
      pathname: '/checkout',
      params: {
        packageId: pkg.id,
        versionId: selectedVer.id,
        mentorId: mentorId,
      },
    });
  };

  if (loading) return <LoadingState />;
  if (error || !pkg)
    return <ErrorState error={error || TEXT.PACKAGE_DETAIL.NOT_FOUND} onRetry={fetchPackage} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.PACKAGE_DETAIL.HEADER_TITLE}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* PACKAGE INFO */}
        <View style={styles.packageCard}>
          <View style={styles.categoryBadge}>
            <Typography variant="caption" style={styles.categoryText}>
              GÓI DỊCH VỤ
            </Typography>
          </View>
          <Typography variant="h2" style={styles.title}>
            {pkg.title}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.desc}>
            {pkg.description}
          </Typography>
        </View>

        {/* VERSION SELECTION */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3" style={styles.sectionTitle}>
            {TEXT.PACKAGE_DETAIL.DURATION_TITLE}
          </Typography>
          <Typography variant="caption" color="secondary">
            {pkg.versions.length} lựa chọn
          </Typography>
        </View>

        <View style={styles.versionContainer}>
          {pkg.versions.map((ver) => {
            const isSelected = selectedVer?.id === ver.id;
            return (
              <TouchableOpacity
                key={ver.id}
                activeOpacity={0.8}
                style={[styles.verCard, isSelected && styles.verCardSelected]}
                onPress={() => setSelectedVer(ver)}
              >
                <View style={styles.verCardMain}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.versionContent}>
                    <Typography
                      variant="bodyMedium"
                      style={[styles.versionDuration, isSelected && { color: theme.colors.primary }]}
                    >
                      {ver.duration} phút mentoring
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      Hình thức: {ver.deliveryType}
                    </Typography>
                  </View>
                  <View style={styles.priceContainer}>
                    <Typography variant="h3" style={styles.priceText}>
                      ${ver.price}
                    </Typography>
                  </View>
                </View>
                {ver.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Typography variant="caption" style={styles.defaultBadgeText}>
                      PHỔ BIẾN NHẤT
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CURRICULUM TIMELINE */}
        {selectedVer && (
          <View style={styles.curriculumSection}>
            <Typography variant="h3" style={[styles.sectionTitle, { marginBottom: 20 }]}>
              {TEXT.PACKAGE_DETAIL.CURRICULUM_TITLE}
            </Typography>
            <View style={styles.timelineContainer}>
              {selectedVer.curriculums.length > 0 ? (
                selectedVer.curriculums.map((curriculum, index) => (
                  <View key={curriculum.id} style={styles.curriculumItem}>
                    <View style={styles.timeline}>
                      <View style={styles.dotContainer}>
                        <View style={styles.dot} />
                      </View>
                      {index < selectedVer.curriculums.length - 1 && <View style={styles.line} />}
                    </View>
                    <View style={styles.currContent}>
                      <Typography variant="bodyMedium" style={styles.curriculumTitle}>
                        Buổi {index + 1}: {curriculum.title}
                      </Typography>
                      <Typography variant="caption" color="secondary" style={styles.curriculumDescription}>
                        {curriculum.description || TEXT.PACKAGE_DETAIL.CURRICULUM_FALLBACK}
                      </Typography>
                      {curriculum.duration > 0 && (
                        <View style={styles.currDurationBadge}>
                          <Ionicons name="time-outline" size={12} color={theme.colors.text.secondary} />
                          <Typography variant="caption" color="secondary" style={{ marginLeft: 4 }}>
                            {curriculum.duration} phút
                          </Typography>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCurriculum}>
                  <Ionicons name="information-circle-outline" size={24} color={theme.colors.text.disabled} />
                  <Typography variant="body" color="secondary" style={{ marginTop: 8 }}>
                    {TEXT.PACKAGE_DETAIL.CURRICULUM_FALLBACK}
                  </Typography>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* STICKY FOOTER */}
      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Typography variant="caption" color="secondary">
            {TEXT.PACKAGE_DETAIL.TOTAL_LABEL}
          </Typography>
          <View style={styles.priceRow}>
            <Typography variant="h2" style={styles.totalPrice}>
              ${selectedVer?.price || 0}
            </Typography>
            <Typography variant="caption" color="secondary" style={{ marginLeft: 4, marginBottom: 4 }}>
              / gói
            </Typography>
          </View>
        </View>
        <CustomButton
          label={TEXT.PACKAGE_DETAIL.PAY_NOW}
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontWeight: '700' },
  headerSpacer: { width: 40 },
  scroll: { padding: 20, paddingBottom: 40 },
  packageCard: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    // Premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: theme.colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: { fontWeight: '800', marginBottom: 12, lineHeight: 32 },
  desc: { lineHeight: 24, fontSize: 15 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: '800', color: theme.colors.text.primary },
  versionContainer: { marginBottom: 32 },
  verCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    marginBottom: 16,
    overflow: 'hidden',
  },
  verCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primaryLight}15`,
  },
  verCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
  versionContent: { flex: 1 },
  versionDuration: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { color: theme.colors.primary, fontWeight: '800' },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 12,
  },
  defaultBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 9 },
  curriculumSection: {
    marginBottom: 40,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  curriculumItem: { flexDirection: 'row', minHeight: 80 },
  timeline: { alignItems: 'center', width: 24, marginRight: 16 },
  dotContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.primaryLight,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: 4,
  },
  currContent: { flex: 1, paddingBottom: 24 },
  curriculumTitle: { fontWeight: '700', fontSize: 16, color: theme.colors.text.primary },
  curriculumDescription: { marginTop: 6, lineHeight: 20, fontSize: 14 },
  currDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  emptyCurriculum: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    // Shadow for sticky footer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  totalBox: { flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  totalPrice: { color: theme.colors.primary, fontWeight: '800' },
  checkoutButton: { flex: 1.5, height: 56, borderRadius: 16 },
});
