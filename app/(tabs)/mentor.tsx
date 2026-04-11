import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { EmptyState } from '../../src/components/states/EmptyState';
import { theme } from '../../src/theme/theme';
import { mentorService } from '../../src/core/services/mentorService';
import { User } from '../../src/core/types';

// ─── Filter categories ────────────────────────────────────────
const CATEGORIES = ['Tất cả', 'Công nghệ thông tin', 'Kinh tế', 'Toán học', 'Ngoại ngữ'];

/**
 * MentorScreen – tương đương "/mentors" trên web (MentorMarketplace).
 * Hero header + search + filter chips + mentor card list.
 */
export default function MentorScreen() {
  const router = useRouter();
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

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

  // ─── Filtering ──────────────────────────────────────────
  const filteredMentors = mentors.filter((m) => {
    const term = searchTerm.toLowerCase();
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

  // ─── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ═══════════════ HERO HEADER ═══════════════ */}
      <View style={styles.heroHeader}>
        <Typography variant="h2" style={styles.heroTitle}>
          Kết nối với{' '}
          <Typography variant="h2" style={styles.heroHighlight}>
            Mentor
          </Typography>
          {' '}hàng đầu
        </Typography>
        <Typography variant="body" style={styles.heroSubtitle}>
          Nhận tư vấn 1-1 để bứt phá trong học tập và sự nghiệp.
        </Typography>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={theme.colors.text.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, chuyên môn..."
            placeholderTextColor={theme.colors.text.disabled}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ═══════════════ FILTER CHIPS ═══════════════ */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipListContent}
        style={styles.chipList}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item;
          return (
            <TouchableOpacity
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(item)}
            >
              <Typography
                variant="caption"
                style={[styles.chipText, isActive && styles.chipTextActive]}
              >
                {item}
              </Typography>
            </TouchableOpacity>
          );
        }}
      />

      {/* ═══════════════ MENTOR LIST ═══════════════ */}
      <FlatList
        data={filteredMentors}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
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
          <MentorCard mentor={item} index={index} onPress={() => router.push(`/profile/${item.id}` as any)} />
        )}
      />
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
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
        {/* ── Header: Avatar + Info ── */}
        <View style={styles.cardHeader}>
          <Image
            source={mentor.avatar ? { uri: mentor.avatar } : require('../../assets/images/icon.png')}
            style={styles.avatar}
          />
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Typography variant="bodyMedium" style={styles.mentorName} numberOfLines={1}>
                {mentor.name}
              </Typography>
              {info?.verificationStatus === 'verified' && (
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
              )}
            </View>
            <Typography variant="caption" color="secondary" numberOfLines={1} style={styles.headline}>
              {info?.headline || 'Mentor'}
            </Typography>
            <View style={styles.statsRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FBBF24" />
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

        {/* ── Expertise Tags ── */}
        {info?.expertise && info.expertise.length > 0 && (
          <View style={styles.tagsContainer}>
            {info.expertise.slice(0, 3).map((exp) => (
              <View key={exp} style={styles.tag}>
                <Typography variant="caption" style={styles.tagText}>
                  {exp}
                </Typography>
              </View>
            ))}
            {info.expertise.length > 3 && (
              <View style={[styles.tag, styles.tagMore]}>
                <Typography variant="caption" style={styles.tagText}>
                  +{info.expertise.length - 3}
                </Typography>
              </View>
            )}
          </View>
        )}

        {/* ── Footer: Price + CTA ── */}
        <View style={styles.cardFooter}>
          <View>
            <Typography variant="caption" style={styles.priceLabel}>
              GIÁ TỪ
            </Typography>
            <View style={styles.priceRow}>
              <Typography variant="h3" style={styles.priceValue}>
                ${info?.price || 0}
              </Typography>
              <Typography variant="caption" color="secondary">
                /giờ
              </Typography>
            </View>
          </View>
          <View style={styles.viewButton}>
            <Typography variant="label" style={styles.viewButtonText}>
              Xem hồ sơ
            </Typography>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ── Hero Header ──
  heroHeader: {
    backgroundColor: theme.colors.text.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 30,
  },
  heroHighlight: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 22,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },

  // ── Filter Chips ──
  chipList: {
    maxHeight: 52,
    flexGrow: 0,
  },
  chipListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontWeight: '600',
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Card ──
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mentorName: {
    color: theme.colors.text.primary,
    fontWeight: '700',
    fontSize: 16,
    flexShrink: 1,
  },
  headline: {
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: theme.colors.text.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border.default,
  },
  sessionText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ── Tags ──
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  tagMore: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  tagText: {
    fontSize: 11,
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
    paddingTop: 14,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceValue: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
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
    fontSize: 13,
  },
});
