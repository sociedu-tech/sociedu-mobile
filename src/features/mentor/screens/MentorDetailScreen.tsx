import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Avatar } from '@/src/components/ui/Avatar';
import { TEXT } from '@/src/core/constants/strings';
import { User } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { mentorService } from '../services/mentorService';

export default function MentorDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMentor = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error('Thiếu mã mentor.');
        }

        const data = await mentorService.getProfile(id);
        if (active) {
          setMentor(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Không thể tải chi tiết mentor.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMentor();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingState message="Đang tải dữ liệu mentor..." />;
  }

  if (error || !mentor) {
    return (
      <ErrorState
        error={error || 'Không tìm thấy hồ sơ mentor.'}
        onRetry={() => router.replace(`/mentor/${id}` as any)}
      />
    );
  }

  const info = mentor.mentorInfo;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.MENTOR.DETAIL_TITLE}
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <Avatar uri={mentor.avatar || undefined} initials={mentor.name.slice(0, 2).toUpperCase()} size={88} />
          <Typography variant="h2" style={styles.name}>
            {mentor.name}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.headline}>
            {info?.headline || TEXT.MENTOR.DEFAULT_HEADLINE}
          </Typography>
          {info?.verificationStatus === 'verified' ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
              <Typography variant="caption" style={styles.verifiedText}>
                {TEXT.MENTOR.VERIFIED}
              </Typography>
            </View>
          ) : null}
        </View>

        <Typography variant="body" style={styles.bio}>
          {mentor.bio || TEXT.MENTOR.NO_BIO}
        </Typography>

        <View style={styles.divider} />

        <Typography variant="h3" style={styles.sectionTitle}>
          {TEXT.MENTOR.SERVICES_TITLE}
        </Typography>

        {info?.packages?.length ? (
          info.packages.map((pkg) => {
            const firstVersion = pkg.versions.find((version) => version.isDefault) ?? pkg.versions[0];
            return (
              <View key={pkg.id} style={styles.packageCard}>
                <Typography variant="bodyMedium" style={styles.pkgTitle}>
                  {pkg.title}
                </Typography>
                <Typography variant="caption" color="secondary" style={styles.pkgDesc}>
                  {pkg.description || 'Chưa có mô tả cho gói dịch vụ này.'}
                </Typography>

                {firstVersion ? (
                  <View style={styles.pkgMeta}>
                    <View>
                      <Typography variant="caption" color="secondary">
                        {TEXT.MENTOR.PRICE_FROM}
                      </Typography>
                      <Typography variant="h3" style={styles.pkgPrice}>
                        ${firstVersion.price}
                      </Typography>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Typography variant="caption" color="secondary">
                        {TEXT.MENTOR.DURATION}
                      </Typography>
                      <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                        {firstVersion.duration} phút
                      </Typography>
                    </View>
                  </View>
                ) : null}

                <CustomButton
                  label={TEXT.MENTOR.VIEW_PACKAGE}
                  onPress={() => router.push(`/package/${pkg.id}?mentorId=${mentor.id}` as any)}
                  style={{ marginTop: 16 }}
                />
              </View>
            );
          })
        ) : (
          <Typography variant="bodyMedium" color="secondary">
            {TEXT.MENTOR.NO_SERVICES}
          </Typography>
        )}
      </ScrollView>
    </SafeAreaView>
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
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifiedText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  bio: {
    lineHeight: 22,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '700',
  },
  packageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 16,
  },
  pkgTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  pkgDesc: {
    marginBottom: 12,
  },
  pkgMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingTop: 12,
  },
  pkgPrice: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
