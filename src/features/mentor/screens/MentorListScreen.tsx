import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Section } from '@/src/components/ui/Section';
import { TEXT } from '@/src/core/constants/strings';
import { User } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { MentorCard } from '../components/MentorCard';
import { mentorService } from '../services/mentorService';

const ALL_CATEGORY = 'Tất cả';
const PAGE_SIZE = 20;

export default function MentorListScreen() {
  const router = useRouter();
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const expertiseTags = useMemo(() => {
    const tags = new Set<string>();
    mentors.forEach((mentor) => mentor.mentorInfo?.expertise?.forEach((item) => tags.add(item)));
    return [ALL_CATEGORY, ...Array.from(tags)];
  }, [mentors]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMentors = useCallback(
    async (options?: { isRefresh?: boolean; nextPage?: number }) => {
      const targetPage = options?.nextPage ?? 1;
      const isRefresh = options?.isRefresh ?? false;
      const isLoadingMore = targetPage > 1;

      if (isLoadingMore) {
        setLoadingMore(true);
      } else if (!isRefresh) {
        setLoading(true);
      }

      setError(null);

      try {
        const result = await mentorService.getAll({
          page: targetPage,
          pageSize: PAGE_SIZE,
          search: debouncedSearchTerm,
          filters: {
            expertise: selectedCategory === ALL_CATEGORY ? undefined : selectedCategory,
          },
          sort: 'rating',
        });

        setMentors((prev) => (targetPage === 1 ? result.items : [...prev, ...result.items]));
        setPage(result.page);
        setHasNextPage(result.hasNextPage);
      } catch {
        setError('Không thể tải danh sách mentor. Vui lòng thử lại.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearchTerm, selectedCategory]
  );

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMentors({ isRefresh: true, nextPage: 1 });
  }, [fetchMentors]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loadingMore || loading) {
      return;
    }

    fetchMentors({ nextPage: page + 1 });
  }, [fetchMentors, hasNextPage, loading, loadingMore, page]);

  if (loading) {
    return <LoadingState message="Đang tìm kiếm các chuyên gia..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchMentors()} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Section style={{ paddingBottom: 0 }}>
        <View
          style={{
            backgroundColor: theme.colors.text.primary,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
            borderBottomLeftRadius: theme.borderRadius.xl,
            borderBottomRightRadius: theme.borderRadius.xl,
          }}
        >
          <Typography variant="h2" style={{ color: '#FFF', fontWeight: '800' }}>
            {TEXT.MENTOR.LIST_HERO_TITLE}
          </Typography>
          <Typography
            variant="body"
            style={{ color: 'rgba(255,255,255,0.6)', marginTop: theme.spacing.sm }}
          >
            {TEXT.MENTOR.LIST_HERO_SUBTITLE}
          </Typography>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.12)',
              marginTop: theme.spacing.lg,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <Ionicons name="search" size={18} color={theme.colors.text.disabled} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 15,
                color: '#FFF',
                padding: 0,
                marginLeft: theme.spacing.sm,
              }}
              placeholder={TEXT.MENTOR.SEARCH_PLACEHOLDER}
              placeholderTextColor={theme.colors.text.disabled}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchTerm.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchTerm('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.text.disabled} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <FlatList
          horizontal
          data={expertiseTags}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            gap: theme.spacing.sm,
          }}
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
                  style={{
                    fontWeight: '600',
                    color: isActive ? '#FFF' : theme.colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  {item}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </Section>

      <Section style={{ flex: 1, paddingTop: 0 }}>
        <FlatList
          data={mentors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? <LoadingState message="Đang tải thêm mentor..." fullScreen={false} /> : null
          }
          ListEmptyComponent={
            <EmptyState
              title={TEXT.MENTOR.EMPTY_TITLE}
              description={TEXT.MENTOR.EMPTY_DESCRIPTION}
              icon="person-outline"
              fullScreen={false}
            />
          }
          renderItem={({ item, index }) => (
            <MentorCard
              mentor={item}
              index={index}
              onPress={() => router.push(`/mentor/${item.id}` as never)}
            />
          )}
        />
      </Section>
    </SafeAreaView>
  );
}
