import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '../../src/components/ui/Avatar';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { User } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

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
    return mentor.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [mentor?.name]);

  if (loading) return <LoadingState message={TEXT.MENTOR_DETAIL.LOADING} />;
  if (error || !mentor) {
    return (
      <ErrorState
        error={error || TEXT.MENTOR_DETAIL.NOT_FOUND}
        onRetry={fetchMentor}
      />
    );
  }

  const info = mentor.mentorInfo;
  const packages = info?.packages ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.MENTOR_DETAIL.HEADER_TITLE}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <Avatar uri={mentor.avatar} initials={initials} size={88} />
          <Typography variant="h2" style={styles.name}>
            {mentor.name}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.headline}>
            {info?.headline || TEXT.MENTOR_DETAIL.DEFAULT_HEADLINE}
          </Typography>
          {info?.verificationStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
              <Typography variant="caption" style={styles.verifiedText}>
                {TEXT.MENTOR_DETAIL.VERIFIED}
              </Typography>
            </View>
          )}
        </View>

        <Typography variant="body" style={styles.bio}>
          {mentor.bio || TEXT.MENTOR_DETAIL.DEFAULT_BIO}
        </Typography>

        <View style={styles.statsRow}>
          <TrustCard
            icon="star-outline"
            label={TEXT.MENTOR_DETAIL.RATING}
            value={(info?.rating ?? 0).toFixed(1)}
          />
          <TrustCard
            icon="time-outline"
            label={TEXT.MENTOR_DETAIL.COMPLETED_SESSIONS}
            value={String(info?.sessionsCompleted ?? 0)}
          />
        </View>

        <SectionBlock title={TEXT.MENTOR_DETAIL.EXPERTISE}>
          {info?.expertise?.length ? (
            <View style={styles.chipsWrap}>
              {info.expertise.map((item) => (
                <View key={item} style={styles.chip}>
                  <Typography variant="caption" style={styles.chipText}>
                    {item}
                  </Typography>
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="body" color="secondary">
              {TEXT.MENTOR_DETAIL.NO_ADDITIONAL_INFO}
            </Typography>
          )}
        </SectionBlock>

        <SectionBlock title={TEXT.MENTOR_DETAIL.EDUCATION}>
          {mentor.educations?.length ? (
            mentor.educations.map((education) => (
              <InfoItem
                key={education.id}
                title={`${education.degree} - ${education.institution}`}
                description={`${education.fieldOfStudy} • ${education.startYear}${education.endYear ? ` - ${education.endYear}` : ''}`}
              />
            ))
          ) : (
            <Typography variant="body" color="secondary">
              {TEXT.MENTOR_DETAIL.NO_ADDITIONAL_INFO}
            </Typography>
          )}
        </SectionBlock>

        <SectionBlock title={TEXT.MENTOR_DETAIL.EXPERIENCE}>
          {mentor.experiences?.length ? (
            mentor.experiences.map((experience) => (
              <InfoItem
                key={experience.id}
                title={`${experience.role} - ${experience.company}`}
                description={experience.description || TEXT.MENTOR_DETAIL.NO_ADDITIONAL_INFO}
              />
            ))
          ) : (
            <Typography variant="body" color="secondary">
              {TEXT.MENTOR_DETAIL.NO_ADDITIONAL_INFO}
            </Typography>
          )}
        </SectionBlock>

        <SectionBlock title={TEXT.MENTOR_DETAIL.CERTIFICATE}>
          {mentor.certificates?.length ? (
            mentor.certificates.map((certificate) => (
              <InfoItem
                key={certificate.id}
                title={certificate.name}
                description={certificate.issuer}
              />
            ))
          ) : (
            <Typography variant="body" color="secondary">
              {TEXT.MENTOR_DETAIL.NO_ADDITIONAL_INFO}
            </Typography>
          )}
        </SectionBlock>

        <Typography variant="h3" style={styles.packagesTitle}>
          {TEXT.MENTOR_DETAIL.PACKAGES}
        </Typography>

        {packages.length === 0 ? (
          <Typography variant="bodyMedium" color="secondary">
            {TEXT.MENTOR_DETAIL.EMPTY_PACKAGES}
          </Typography>
        ) : (
          packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.packageCard}
              onPress={() =>
                router.push({
                  pathname: '/package/[id]',
                  params: { id: pkg.id, mentorId: id },
                })
              }
            >
              <View style={styles.packageHeader}>
                <View style={styles.packageContent}>
                  <Typography variant="bodyMedium" style={styles.pkgTitle}>
                    {pkg.title}
                  </Typography>
                  <Typography variant="caption" color="secondary" numberOfLines={2}>
                    {pkg.description}
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.border.default} />
              </View>

              <View style={styles.pkgFooter}>
                <Typography variant="caption" color="secondary">
                  {TEXT.MENTOR_DETAIL.STARTING_FROM}
                </Typography>
                <Typography variant="bodyMedium" style={styles.pkgPrice}>
                  ${pkg.versions[0]?.price || 0}
                </Typography>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TrustCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.trustCard}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Typography variant="caption" color="secondary" style={styles.trustLabel}>
        {label}
      </Typography>
      <Typography variant="h3" style={styles.trustValue}>
        {value}
      </Typography>
    </View>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Typography variant="bodyMedium" style={styles.sectionTitle}>
        {title}
      </Typography>
      {children}
    </View>
  );
}

function InfoItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.infoItem}>
      <Typography variant="bodyMedium" style={styles.infoTitle}>
        {title}
      </Typography>
      <Typography variant="caption" color="secondary" style={styles.infoDescription}>
        {description}
      </Typography>
    </View>
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
  headerSpacer: {
    width: 24,
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
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trustCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 16,
    padding: 16,
  },
  trustLabel: {
    marginTop: 10,
    marginBottom: 6,
  },
  trustValue: {
    fontWeight: '800',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  infoItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  infoTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDescription: {
    lineHeight: 18,
  },
  packagesTitle: {
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageContent: {
    flex: 1,
  },
  pkgTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  pkgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  pkgPrice: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
