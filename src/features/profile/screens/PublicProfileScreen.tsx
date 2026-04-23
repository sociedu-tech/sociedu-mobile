import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/src/components/typography/Typography';
import { User } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { userService } from '../services/userService';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!id) {
          throw new Error('Missing User ID');
        }
        const data = await userService.getPublicProfile(id);
        setProfile(data);
      } catch {
        setError('Không thể tải hồ sơ người dùng.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Typography variant="body" style={styles.errorText}>
          {error || 'Không tìm thấy hồ sơ.'}
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: profile.avatar || undefined }} style={styles.avatar} />
        <View style={styles.nameSection}>
          <Typography variant="h2" style={styles.name}>
            {profile.name}
          </Typography>
          {profile.mentorInfo?.verificationStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
              <Typography variant="caption" style={{ color: '#3B82F6', fontWeight: '600' }}>
                Đã xác minh
              </Typography>
            </View>
          )}
        </View>
        {profile.mentorInfo?.headline && (
          <Typography variant="body" style={styles.headline}>
            {profile.mentorInfo.headline}
          </Typography>
        )}
      </View>

      {profile.mentorInfo && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FBBF24" />
            <Typography variant="h3" style={styles.statValue}>
              {profile.mentorInfo.rating}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>Đánh giá</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Typography variant="h3" style={styles.statValue}>
              {profile.mentorInfo.sessionsCompleted}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>Buổi học</Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={20} color={theme.colors.success} />
            <Typography variant="h3" style={styles.statValue}>
              ${profile.mentorInfo.price}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>/ giờ</Typography>
          </View>
        </View>
      )}

      {profile.mentorInfo?.expertise && profile.mentorInfo.expertise.length > 0 && (
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>Chuyên môn</Typography>
          <View style={styles.tagsContainer}>
            {profile.mentorInfo.expertise.map((expertise) => (
              <View key={expertise} style={styles.tag}>
                <Typography variant="caption" style={styles.tagText}>{expertise}</Typography>
              </View>
            ))}
          </View>
        </View>
      )}

      {profile.bio && (
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>Giới thiệu</Typography>
          <Typography variant="body" style={styles.bio}>
            {profile.bio}
          </Typography>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    marginTop: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 16,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headline: {
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border.default,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 20,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  bio: {
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
});
