import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/src/components/typography/Typography';
import { Avatar } from '@/src/components/ui/Avatar';
import { Conversation } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { chatService } from '../services/chatService';

type FilterTab = 'Tất cả' | 'Chưa đọc' | 'Lịch hẹn';

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 1000 * 60 * 60 * 24) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export default function MessageListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('Tất cả');

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const data = await chatService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conversation) => {
        const matchesSearch =
          conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab =
          activeTab === 'Tất cả' ||
          (activeTab === 'Chưa đọc' && conversation.unreadCount > 0) ||
          (activeTab === 'Lịch hẹn' && conversation.type === 'session');

        return matchesSearch && matchesTab;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.lastMessageTime - a.lastMessageTime;
      });
  }, [activeTab, conversations, searchTerm]);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/messages/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        <Avatar uri={item.avatar} size={56} />
        {item.isPinned && (
          <View style={styles.pinBadge}>
            <Ionicons name="pin" size={10} color="#FFF" />
          </View>
        )}
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <Typography variant="bodyMedium" weight="700" color="primary" numberOfLines={1} style={{ flex: 1 }}>
            {item.name}
          </Typography>
          <Typography variant="caption" color="secondary">
            {formatTime(item.lastMessageTime)}
          </Typography>
        </View>

        <View style={styles.messageRow}>
          <Typography
            variant="caption"
            color={item.unreadCount > 0 ? 'primary' : 'secondary'}
            numberOfLines={1}
            style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadText]}
          >
            {item.lastMessage}
          </Typography>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Typography variant="caption" color="inverse" weight="700" style={{ fontSize: 10 }}>
                {item.unreadCount}
              </Typography>
            </View>
          )}
        </View>

        {item.type === 'session' && (
          <View style={styles.sessionTag}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.info} />
            <Typography variant="caption" style={{ color: theme.colors.info, marginLeft: 4, fontWeight: '600' }}>
              Phiên học
            </Typography>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <Typography variant="h2" weight="800" style={{ marginBottom: theme.spacing.md }}>
          Tin nhắn
        </Typography>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={theme.colors.text.secondary} />
          <TextInput
            placeholder="Tìm kiếm tin nhắn..."
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={theme.colors.text.disabled}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {(['Tất cả', 'Chưa đọc', 'Lịch hẹn'] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Typography variant="caption" weight="600" style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.colors.text.disabled} />
              <Typography variant="body" color="secondary" style={{ marginTop: 16 }}>
                Không tìm thấy cuộc hội thoại nào
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    height: 48,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: '#FFF',
  },
  listContent: {
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  pinBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  contentWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginLeft: 88,
  },
  sessionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: theme.colors.primaryLighter,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
