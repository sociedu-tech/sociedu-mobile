import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/states/EmptyState';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Section } from '@/src/components/ui/Section';
import { User } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { MentorCard } from '../components/MentorCard';
import { mentorService } from '../services/mentorService';

export default function MentorListScreen() {
  const router = useRouter();
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tat ca');

  const expertiseTags = useMemo(() => {
    const tags = new Set<string>();
    mentors.forEach((mentor) => mentor.mentorInfo?.expertise?.forEach((item) => tags.add(item)));
    return ['Tat ca', ...Array.from(tags)];
  }, [mentors]);

  const fetchMentors = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await mentorService.getAll();
      setMentors(data);
    } catch {
      setError('Khong the tai danh sach mentor. Vui long thu lai.');
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

  const filteredMentors = mentors.filter((mentor) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      mentor.name.toLowerCase().includes(term) ||
      mentor.mentorInfo?.headline?.toLowerCase().includes(term) ||
      mentor.mentorInfo?.expertise?.some((item) => item.toLowerCase().includes(term));

    const matchesCategory =
      selectedCategory === 'Tat ca' ||
      mentor.mentorInfo?.expertise?.some((item) =>
        item.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingState message="Dang tim kiem cac chuyen gia..." />;
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
            Ket noi voi{' '}
            <Typography variant="h2" style={{ color: theme.colors.primary, fontWeight: '800' }}>
              Mentor
            </Typography>{' '}
            hang dau
          </Typography>
          <Typography variant="body" style={{ color: 'rgba(255,255,255,0.6)', marginTop: theme.spacing.sm }}>
            Nhan tu van 1-1 de but pha trong hoc tap va su nghiep.
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
              style={{ flex: 1, fontSize: 15, color: '#FFF', padding: 0, marginLeft: theme.spacing.sm }}
              placeholder="Tim theo ten, chuyen mon..."
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
              title="Khong tim thay Mentor"
              description="Thu tim kiem voi tu khoa khac hoac xoa bo loc."
              icon="person-outline"
              fullScreen={false}
            />
          }
          renderItem={({ item, index }) => (
            <MentorCard mentor={item} index={index} onPress={() => router.push(`/profile/${item.id}` as any)} />
          )}
        />
      </Section>
    </SafeAreaView>
  );
}
