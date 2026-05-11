import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { EmptyState } from '../../src/components/states/EmptyState';
import { theme } from '../../src/theme/theme';
import { mentorService } from '../../src/core/services/mentorService';
import { User } from '../../src/core/types';
import { Card } from '../../src/components/ui/Card';
import { Section } from '../../src/components/ui/Section';
import { Avatar } from '../../src/components/ui/Avatar';
import { scaleSpace, scaleFont } from '../../src/theme/responsiveUtils';

import { useDebounce } from '../../src/hooks/useDebounce';
import { useAuthStore } from '../../src/core/store/authStore';

// ...existing code...

/**
 * MentorScreen – tương đương "/mentors" trên web (MentorMarketplace).
 * Hero header + search + filter chips + mentor card list.
 */
export default function MentorScreen() {
  const router = useRouter();
  const activeMode = useAuthStore((s) => s.activeMode);
  const isMentor = useAuthStore((s) => s.roles.includes('mentor'));
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Debounce 300ms – tránh filter/re-render liên tục khi user đang gõ
  const debouncedSearch = useDebounce(searchTerm, 300);
  const isSearching = searchTerm !== debouncedSearch;

  // Lấy tất cả các lĩnh vực chuyên môn duy nhất từ mentors
  const expertiseTags = useMemo(() => {
    const tags = new Set<string>();
    mentors.forEach(m => m.mentorInfo?.expertise?.forEach((e: string) => tags.add(e)));
    return ['Tất cả', ...Array.from(tags)];
  }, [mentors]);

  // ─── Fetch ──────────────────────────────────────────────
  const fetchMentors = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await mentorService.getAll();
      setMentors(data);
    } catch {
      setError('Không thể tải danh sách Mentor. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMentors(true);
  }, [fetchMentors]);

  // ─── Filtering (dùng debouncedSearch, không phải searchTerm thô) ──
  const filteredMentors = mentors.filter((m) => {
    const term = debouncedSearch.toLowerCase();
    const matchesSearch =
      !term ||
      m.name.toLowerCase().includes(term) ||
      m.mentorInfo?.headline?.toLowerCase().includes(term) ||
      m.mentorInfo?.expertise?.some((e) => e.toLowerCase().includes(term));

    const matchesCategory =
      selectedCategory === 'Tất cả' ||
      m.mentorInfo?.expertise?.some((e) =>
        e.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });

  // ─── Loading / Error states ─────────────────────────────
  if (loading) {
    return <LoadingState message="Đang tìm kiếm các chuyên gia..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchMentors()} />;
  }

  if (isMentor && activeMode === 'mentor') {
    return <Redirect href="/mentor/dashboard" />;
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <Section style={{ paddingBottom: 0 }}>
        {/* HERO HEADER */}
        <View style={{ backgroundColor: theme.colors.text.primary, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl, borderBottomLeftRadius: theme.borderRadius.xl, borderBottomRightRadius: theme.borderRadius.xl }}>
          <Typography variant="h2" style={{ color: '#FFF', fontWeight: '800' }}>
            Kết nối với{' '}
            <Typography variant="h2" style={{ color: theme.colors.primary, fontWeight: '800' }}>Mentor</Typography>
            {' '}hàng đầu
          </Typography>
          <Typography variant="body" style={{ color: 'rgba(255,255,255,0.6)', marginTop: theme.spacing.sm }}>
            Nhận tư vấn 1-1 để bứt phá trong học tập và sự nghiệp.
          </Typography>
          {/* Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', marginTop: theme.spacing.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
            <Ionicons name="search" size={18} color={theme.colors.text.disabled} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: '#FFF', padding: 0, marginLeft: theme.spacing.sm }}
              placeholder="Tìm theo tên, chuyên môn..."
              placeholderTextColor={theme.colors.text.disabled}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {/* Hiển thị spinner khi đang chờ debounce */}
            {isSearching ? (
              <ActivityIndicator size="small" color={theme.colors.text.disabled} />
            ) : searchTerm.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchTerm('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={theme.colors.text.disabled} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {/* FILTER CHIPS */}
        <FlatList
          horizontal
          data={expertiseTags}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, gap: theme.spacing.sm }}
          style={{ flexGrow: 0 }}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginRight: theme.spacing.sm,
                }}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item)}
              >
                <Typography
                  variant="bodyMedium"
                  style={{ fontWeight: '600', color: isActive ? '#FFF' : theme.colors.text.secondary, textAlign: 'center' }}
                >
                  {item}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </Section>
      {/* MENTOR LIST */}
      <Section style={{ flex: 1, paddingTop: 0 }}>
        <FlatList
          data={filteredMentors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Không tìm thấy Mentor"
              description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."
              icon="person-outline"
              fullScreen={false}
            />
          }
          renderItem={({ item, index }) => (
            <MentorCard mentor={item} index={index} onPress={() => router.push(`/mentor/${item.id}` as any)} />
          )}
        />
      </Section>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MENTOR CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
interface MentorCardProps {
  mentor: User;
  index: number;
  onPress: () => void;
}

function MentorCard({ mentor, index, onPress }: MentorCardProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const info = mentor.mentorInfo;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Card style={{ marginBottom: theme.spacing.md }}>
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ flex: 1 }}>
          {/* Header: Avatar + Info */}
          <View style={styles.cardHeader}>
            <Avatar uri={mentor.avatar || undefined} size={56} />
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Typography variant="bodyMedium" style={styles.mentorName} numberOfLines={1}>
                  {mentor.name}
                </Typography>
                {info?.verificationStatus === 'verified' && (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                )}
              </View>
              <Typography variant="caption" color="secondary" numberOfLines={1} style={styles.headline}>
                {info?.headline || 'Mentor'}
              </Typography>
              <View style={styles.statsRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={theme.colors.warning} />
                  <Typography variant="caption" style={styles.ratingText}>
                    {info?.rating?.toFixed(1) || '0.0'}
                  </Typography>
                </View>
                <View style={styles.dotSeparator} />
                <Typography variant="caption" color="secondary" style={styles.sessionText}>
                  {info?.sessionsCompleted || 0} buổi học
                </Typography>
              </View>
            </View>
          </View>

          {/* Expertise Tags */}
          {info?.expertise && info.expertise.length > 0 && (
            <View style={styles.tagsContainer}>
              {info.expertise.slice(0, 3).map((exp) => (
                <View key={exp} style={styles.tag}>
                  <Typography variant="caption" style={styles.tagText}>{exp}</Typography>
                </View>
              ))}
              {info.expertise.length > 3 && (
                <View style={[styles.tag, styles.tagMore]}>
                  <Typography variant="caption" style={styles.tagText}>+{info.expertise.length - 3}</Typography>
                </View>
              )}
            </View>
          )}

          {/* Footer: Price + CTA */}
          <View style={styles.cardFooter}>
            <View>
              <Typography variant="caption" style={styles.priceLabel}>
                GIÁ TỪ
              </Typography>
              <View style={styles.priceRow}>
                <Typography variant="h3" style={styles.priceValue}>
                  ${info?.price || 0}
                </Typography>
                <Typography variant="caption" color="secondary">/giờ</Typography>
              </View>
            </View>
            <View style={styles.viewButton}>
              <Typography variant="label" style={styles.viewButtonText}>Xem hồ sơ</Typography>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    gap: scaleSpace(12),
    marginBottom: scaleSpace(14),
  },
  avatar: {
    width: scaleSpace(56),
    height: scaleSpace(56),
    borderRadius: scaleSpace(18),
    backgroundColor: theme.colors.primaryLight,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpace(6),
  },
  mentorName: {
    color: theme.colors.text.primary,
    fontWeight: '700',
    fontSize: scaleFont(16),
    flexShrink: 1,
  },
  headline: {
    marginTop: scaleSpace(2),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpace(8),
    marginTop: scaleSpace(6),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpace(3),
  },
  ratingText: {
    color: theme.colors.text.primary,
    fontWeight: '700',
    fontSize: scaleFont(12),
  },
  dotSeparator: {
    width: scaleSpace(4),
    height: scaleSpace(4),
    borderRadius: scaleSpace(2),
    backgroundColor: theme.colors.border.default,
  },
  sessionText: {
    fontSize: scaleFont(11),
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ── Tags ──
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSpace(6),
    marginBottom: scaleSpace(14),
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: scaleSpace(10),
    paddingVertical: scaleSpace(5),
    borderRadius: scaleSpace(8),
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  tagMore: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  tagText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },

  // ── Footer ──
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingTop: scaleSpace(14),
  },
  priceLabel: {
    fontSize: scaleFont(10),
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: scaleSpace(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: scaleSpace(2),
  },
  priceValue: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSpace(6),
    backgroundColor: theme.colors.primary,
    paddingHorizontal: scaleSpace(18),
    paddingVertical: scaleSpace(10),
    borderRadius: theme.borderRadius.lg,
    // shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: scaleFont(13),
  },
});
