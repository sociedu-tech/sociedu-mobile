import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Avatar } from '../../src/components/ui/Avatar';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { User } from '../../src/core/types';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';

const { width } = Dimensions.get('window');

export default function MentorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) throw new Error('Missing Mentor ID');
      const data = await mentorService.getProfile(id);
      setMentor(data);
    } catch (err: any) {
      setError(err?.message || TEXT.MENTOR_DETAIL.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchMentor();
  }, [fetchMentor]);

  const initials = useMemo(() => {
    if (!mentor?.name) return 'CG';
    return mentor.name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  }, [mentor?.name]);

  if (loading) return <LoadingState message={TEXT.MENTOR_DETAIL.LOADING} />;
  if (error || !mentor) return <ErrorState error={error || TEXT.MENTOR_DETAIL.NOT_FOUND} onRetry={fetchMentor} />;

  const info = mentor.mentorInfo;
  const packages = info?.packages ?? [];

  return (
    <View style={styles.container}>
      {/* HEADER WITH GRADIENT */}
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.topGradient}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <Typography variant="bodyMedium" style={{ color: '#FFF', fontWeight: '700' }}>Hồ sơ Chuyên gia</Typography>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* PROFILE INFO CARD */}
        <View style={styles.profileCardWrapper}>
          <Card variant="premium" style={styles.profileCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarBorder}>
                <Avatar uri={mentor.avatar} initials={initials} size={96} />
                {info?.verificationStatus === 'verified' && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.nameSection}>
                <Typography variant="h2" style={{ fontWeight: '900', color: theme.colors.text.primary }}>{mentor.name}</Typography>
                <Typography variant="body" color="muted" numberOfLines={1}>{info?.headline || 'Chuyên gia Mentor'}</Typography>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={theme.colors.warning} />
                  <Typography variant="label" style={{ marginLeft: 4, fontWeight: '800' }}>{(info?.rating ?? 5.0).toFixed(1)}</Typography>
                  <Typography variant="caption" color="muted" style={{ marginLeft: 8 }}>({info?.sessionsCompleted || 0} buổi học)</Typography>
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            
            <Typography variant="body" color="secondary" style={styles.bio}>
              {mentor.bio || TEXT.MENTOR_DETAIL.DEFAULT_BIO}
            </Typography>
            
            <View style={styles.chipsWrap}>
              {(info?.expertise || ['Kỹ năng mềm', 'Phát triển bản thân']).map((item) => (
                <View key={item} style={styles.chip}>
                  <Typography variant="caption" style={styles.chipText}>{item}</Typography>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* EXPERIENCE SECTIONS */}
        <View style={styles.section}>
          <Typography variant="label" style={styles.sectionLabel}>Lịch sử học vấn & làm việc</Typography>
          <Card style={styles.contentCard}>
            {mentor.educations?.map((edu) => (
              <InfoItem key={edu.id} icon="school" title={edu.institution} subtitle={edu.degree} />
            ))}
            {mentor.experiences?.map((exp) => (
              <InfoItem key={exp.id} icon="briefcase" title={exp.company} subtitle={exp.role} />
            ))}
            {(!mentor.educations?.length && !mentor.experiences?.length) && (
              <Typography variant="caption" color="muted">Chưa cập nhật thông tin chi tiết</Typography>
            )}
          </Card>
        </View>

        {/* PACKAGES */}
        <View style={styles.section}>
          <Typography variant="label" style={styles.sectionLabel}>Các gói dịch vụ</Typography>
          {packages.length === 0 ? (
            <Card style={styles.emptyCard}><Typography variant="caption" color="muted">Hiện chưa có dịch vụ nào khả dụng</Typography></Card>
          ) : (
            packages.map((pkg) => (
              <TouchableOpacity 
                key={pkg.id} 
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/package/[id]', params: { id: pkg.id, mentorId: id } } as any)}
              >
                <Card variant="premium" style={styles.packageCard}>
                  <View style={styles.pkgTop}>
                    <View style={styles.pkgIcon}>
                      <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Typography variant="bodyMedium" style={{ fontWeight: '800' }}>{pkg.title}</Typography>
                      <Typography variant="caption" color="muted" numberOfLines={1}>{pkg.description}</Typography>
                    </View>
                  </View>
                  <View style={styles.pkgBottom}>
                    <View style={styles.priceBadge}>
                      <Typography variant="label" style={{ color: theme.colors.primary }}>Từ ${pkg.versions[0]?.price || 0}</Typography>
                    </View>
                    <Typography variant="label" style={{ color: theme.colors.primary, fontWeight: '800' }}>Chi tiết →</Typography>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoItem({ icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={16} color={theme.colors.secondary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>{title}</Typography>
        <Typography variant="caption" color="muted">{subtitle}</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topGradient: { height: 160, paddingHorizontal: 20 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 100 },
  profileCardWrapper: { paddingHorizontal: 20, marginTop: -60 },
  profileCard: { padding: 20, borderRadius: 28 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBorder: { padding: 3, borderRadius: 52, backgroundColor: '#FFF', ...theme.shadows.medium, position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFF', borderRadius: 10, padding: 2, ...theme.shadows.soft },
  nameSection: { flex: 1, marginLeft: 20 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  divider: { height: 1, backgroundColor: theme.colors.border.light, marginVertical: 20 },
  bio: { lineHeight: 22, marginBottom: 16 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: theme.colors.primarySoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: theme.colors.primary, fontWeight: '700', fontSize: 11 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionLabel: { textTransform: 'uppercase', color: theme.colors.text.muted, fontSize: 12, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  contentCard: { paddingVertical: 8, borderRadius: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  infoIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  emptyCard: { padding: 20, alignItems: 'center' },
  packageCard: { padding: 16, borderRadius: 24, marginBottom: 12 },
  pkgTop: { flexDirection: 'row', alignItems: 'center' },
  pkgIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  pkgBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border.light },
  priceBadge: { backgroundColor: theme.colors.primarySoft, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
});
