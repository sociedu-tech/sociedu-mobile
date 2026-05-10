import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../../src/components/states/EmptyState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { Avatar } from '../../src/components/ui/Avatar';
import { TEXT } from '../../src/core/constants/strings';
import { conversationService } from '../../src/core/services/conversationService';
import { useAuthStore } from '../../src/core/store/authStore';
import { Conversation } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

type FilterTab = 'all' | 'unread' | 'booking';

function formatConversationTime(value: Date | null) {
  if (!value) return '';
  const diff = Date.now() - value.getTime();
  if (diff < 1000 * 60 * 60 * 24) {
    return value.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function getBadgeMeta(type: Conversation['type']) {
  if (type === 'booking') return { icon: 'bookmark-outline' as const, label: TEXT.MESSAGES.BADGE_BOOKING };
  if (type === 'support') return { icon: 'help-buoy-outline' as const, label: TEXT.MESSAGES.BADGE_SUPPORT };
  return { icon: 'chatbubble-ellipses-outline' as const, label: TEXT.MESSAGES.BADGE_GENERAL };
}

export default function InboxScreen() {
  const router = useRouter();
  const authLoading = useAuthStore((state) => state.loading);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await conversationService.getMyConversations(currentUserId);
      setConversations(data);
    } catch (loadError: any) {
      setError(loadError?.message || TEXT.MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!authLoading && currentUserId) {
      void loadConversations();
    }
  }, [authLoading, currentUserId, loadConversations]);

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return conversations
      .filter((conversation) => {
        const matchesSearch =
          keyword.length === 0 ||
          conversation.name.toLowerCase().includes(keyword) ||
          conversation.lastMessageText.toLowerCase().includes(keyword);
        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'unread' && conversation.unreadCount > 0) ||
          (activeTab === 'booking' && conversation.type === 'booking');

        return matchesSearch && matchesTab;
      })
      .sort((left, right) => {
        const leftTime = left.lastMessageAt?.getTime() ?? left.updatedAt.getTime();
        const rightTime = right.lastMessageAt?.getTime() ?? right.updatedAt.getTime();
        return rightTime - leftTime;
      });
  }, [activeTab, conversations, searchTerm]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const badge = getBadgeMeta(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/messages/${item.id}` as any)}
        style={styles.conversationItem}
      >
        <Avatar uri={item.avatar ?? undefined} size={56} />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Typography numberOfLines={1} style={styles.nameText} variant="bodyMedium">
              {item.name}
            </Typography>
            <Typography color="secondary" variant="caption">
              {formatConversationTime(item.lastMessageAt)}
            </Typography>
          </View>

          <View style={styles.messageRow}>
            <Typography
              color={item.unreadCount > 0 ? 'primary' : 'secondary'}
              numberOfLines={1}
              style={styles.previewText}
              variant="caption"
            >
              {item.lastMessageText || TEXT.MESSAGES.EMPTY_STATE}
            </Typography>
            {item.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Typography color="inverse" style={styles.unreadValue} variant="caption">
                  {item.unreadCount}
                </Typography>
              </View>
            ) : null}
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Ionicons color={theme.colors.primary} name={badge.icon} size={12} />
              <Typography style={styles.typeLabel} variant="caption">
                {badge.label}
              </Typography>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingState message={TEXT.COMMON.LOADING} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => loadConversations()} />;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <Typography style={styles.screenTitle} variant="h2">
          {TEXT.MESSAGES.SCREEN_TITLE}
        </Typography>
        <View style={styles.searchBar}>
          <Ionicons color={theme.colors.text.secondary} name="search-outline" size={20} />
          <TextInput
            onChangeText={setSearchTerm}
            placeholder={TEXT.MESSAGES.SEARCH_PLACEHOLDER}
            placeholderTextColor={theme.colors.text.disabled}
            style={styles.searchInput}
            value={searchTerm}
          />
        </View>
      </View>

      <View style={styles.tabsRow}>
        {[
          { key: 'all' as const, label: TEXT.MESSAGES.TAB_ALL },
          { key: 'unread' as const, label: TEXT.MESSAGES.TAB_UNREAD },
          { key: 'booking' as const, label: TEXT.MESSAGES.TAB_BOOKING },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <Typography
              style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}
              variant="caption"
            >
              {tab.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        contentContainerStyle={filteredConversations.length === 0 ? styles.emptyList : styles.listContent}
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            onRefresh={() => loadConversations(true)}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={renderConversation}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            description={searchTerm.trim() ? undefined : TEXT.MESSAGES.EMPTY_STATE}
            fullScreen={false}
            icon="chatbubble-ellipses-outline"
            title={searchTerm.trim() ? TEXT.MESSAGES.EMPTY_SEARCH : TEXT.MESSAGES.EMPTY_STATE}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md },
  screenTitle: { fontWeight: '800', marginBottom: theme.spacing.md },
  searchBar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.sm,
    minHeight: 48,
  },
  tabsRow: { flexDirection: 'row', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg },
  tabButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  tabButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabLabel: { color: theme.colors.text.secondary, fontWeight: '600' },
  tabLabelActive: { color: theme.colors.text.inverse },
  listContent: { paddingBottom: theme.spacing.xxl, paddingTop: theme.spacing.md },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  conversationItem: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  conversationContent: { flex: 1, marginLeft: theme.spacing.md },
  conversationHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  nameText: { flex: 1, fontWeight: '700', marginRight: theme.spacing.sm },
  messageRow: { alignItems: 'center', flexDirection: 'row', marginTop: theme.spacing.xs },
  previewText: { flex: 1, marginRight: theme.spacing.sm },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: theme.spacing.xs,
  },
  unreadValue: { fontSize: 10, fontWeight: '700' },
  badgeRow: { marginTop: theme.spacing.sm },
  typeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  typeLabel: { color: theme.colors.primary, fontWeight: '600', marginLeft: theme.spacing.xs },
  separator: { backgroundColor: theme.colors.border.default, height: 1, marginLeft: 96 },
});
