import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../src/components/button/CustomButton';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Avatar } from '../../src/components/ui/Avatar';
import { Typography } from '../../src/components/typography/Typography';
import { toPackage } from '../../src/core/adapters/mentorAdapter';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { useAuthStore } from '../../src/core/store/authStore';
import { MentorPackage, MentorPackageVersion, User } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

export default function PackageDetailScreen() {
  const { id, mentorId } = useLocalSearchParams<{ id: string; mentorId: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [mentor, setMentor] = useState<User | null>(null);
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

      const [mentorData, packages] = await Promise.all([
        mentorService.getProfile(mentorId),
        mentorService.getPackages(mentorId),
      ]);
      const found = packages.find((item) => String(item.id) === id);

      if (!found) {
        throw new Error(TEXT.PACKAGE_DETAIL.NOT_FOUND);
      }

      const uiPkg = toPackage(found);
      setMentor(mentorData);
      setPkg(uiPkg);
      setSelectedVer(uiPkg.versions[0] ?? null);
    } catch (err: any) {
      setError(err?.message || TEXT.PACKAGE_DETAIL.NOT_FOUND);
    } finally {
      setLoading(false);
    }
  }, [id, mentorId]);

  useEffect(() => {
    void fetchPackage();
  }, [fetchPackage]);

  const handleCheckout = async () => {
    if (!selectedVer) return;

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
      pathname: '/checkout/[versionId]',
      params: {
        versionId: selectedVer.id,
        packageId: pkg?.id ?? id,
        mentorId,
      },
    } as any);
  };

  if (loading) return <LoadingState />;
  if (error || !pkg) return <ErrorState error={error || TEXT.PACKAGE_DETAIL.NOT_FOUND} onRetry={fetchPackage} />;

  const mentorInitials = (mentor?.name || 'Mentor')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const cancelPolicy =
    (pkg as MentorPackage & { cancelPolicy?: string }).cancelPolicy ||
    'Việc hủy lịch và hoàn tiền phụ thuộc vào xác nhận của mentor và chính sách nền tảng. Nếu giao dịch có vấn đề, vui lòng liên hệ hỗ trợ để được xử lý.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.PACKAGE_DETAIL.HEADER_TITLE}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {mentor && (
          <View style={styles.mentorCard}>
            <Avatar uri={mentor.avatar} initials={mentorInitials} size={56} />
            <View style={styles.mentorInfo}>
              <View style={styles.mentorNameRow}>
                <Typography variant="bodyMedium" style={styles.mentorName}>
                  {mentor.name || 'Mentor'}
                </Typography>
                {mentor.mentorInfo?.verificationStatus === 'verified' && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.text.inverse} />
                    <Typography variant="caption" style={styles.verifiedText}>
                      Đã xác minh
                    </Typography>
                  </View>
                )}
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Typography variant="caption" color="secondary" style={styles.ratingText}>
                  {(mentor.mentorInfo?.rating ?? mentor.rating ?? 0).toFixed(1)}
                </Typography>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Typography variant="h2" style={styles.title}>
            {pkg.title}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.desc}>
            {pkg.description}
          </Typography>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>
          {TEXT.PACKAGE_DETAIL.DURATION_TITLE}
        </Typography>
        <View style={styles.versionContainer}>
          {pkg.versions.map((ver) => {
            const isSelected = selectedVer?.id === ver.id;
            return (
              <TouchableOpacity
                key={ver.id}
                style={[styles.verCard, isSelected && styles.verCardSelected]}
                onPress={() => setSelectedVer(ver)}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.versionContent}>
                  <Typography variant="bodyMedium" style={styles.versionDuration}>
                    {ver.duration} phút
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {ver.deliveryType}
                  </Typography>
                </View>
                <Typography variant="h3" style={styles.priceText}>
                  ${ver.price}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedVer && (
          <>
            <Typography variant="h3" style={styles.sectionTitle}>
              {TEXT.PACKAGE_DETAIL.CURRICULUM_TITLE}
            </Typography>
            {selectedVer.curriculums.map((curriculum, index) => (
              <View key={curriculum.id} style={styles.curriculumItem}>
                <View style={styles.timeline}>
                  <View style={styles.dot} />
                  {index < selectedVer.curriculums.length - 1 && <View style={styles.line} />}
                </View>
                <View style={styles.currContent}>
                  <Typography variant="bodyMedium" style={styles.curriculumTitle}>
                    {curriculum.title}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={styles.curriculumDescription}>
                    {curriculum.description || TEXT.PACKAGE_DETAIL.CURRICULUM_FALLBACK}
                  </Typography>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.policyCard}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Chính sách hủy & hoàn tiền
          </Typography>
          <Typography variant="body" color="secondary" style={styles.policyText}>
            {cancelPolicy}
          </Typography>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Typography variant="caption" color="secondary">
            {TEXT.PACKAGE_DETAIL.TOTAL_LABEL}
          </Typography>
          <Typography variant="h2" style={styles.totalPrice}>
            ${selectedVer?.price || 0}
          </Typography>
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
  scroll: { padding: 20 },
  mentorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  mentorInfo: { flex: 1, marginLeft: 12 },
  mentorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mentorName: { fontWeight: '700', marginRight: 8 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.info,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    color: theme.colors.text.inverse,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: { marginLeft: 4 },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  title: { fontWeight: '800', marginBottom: 12 },
  desc: { lineHeight: 22 },
  sectionTitle: { marginBottom: 16, fontWeight: '700' },
  versionContainer: { marginBottom: 24 },
  verCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 12,
  },
  verCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primaryLight}10`,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  versionContent: { flex: 1 },
  versionDuration: { fontWeight: '700' },
  priceText: { color: theme.colors.primary },
  curriculumItem: { flexDirection: 'row', marginBottom: 20 },
  timeline: { alignItems: 'center', width: 20, marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary, marginTop: 6 },
  line: { width: 2, flex: 1, backgroundColor: theme.colors.border.default, marginVertical: 4 },
  currContent: { flex: 1, paddingTop: 2 },
  curriculumTitle: { fontWeight: '700' },
  curriculumDescription: { marginTop: 4 },
  policyCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  policyText: { lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  totalBox: { flex: 1 },
  totalPrice: { color: theme.colors.primary },
  checkoutButton: { flex: 1.5 },
});
