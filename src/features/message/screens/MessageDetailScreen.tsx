import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/src/components/typography/Typography';
import { Avatar } from '@/src/components/ui/Avatar';
import { Card } from '@/src/components/ui/Card';
import { ChatMessage, ChatSession, Conversation } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { chatService } from '../services/chatService';

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

const formatCurrency = (amount: number) => `${amount.toLocaleString('vi-VN')} d`;

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const allConversations = await chatService.getConversations();
      const currentConversation = allConversations.find((item) => item.id === id);

      if (currentConversation) {
        setConversation(currentConversation);

        const currentMessages = await chatService.getMessages(currentConversation.id);
        setMessages(currentMessages);
        await chatService.markConversationRead(currentConversation.id);

        if (currentConversation.sessionId) {
          const currentSession = await chatService.getChatSession(currentConversation.sessionId);
          setSession(currentSession);
        } else {
          setSession(null);
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !id) {
      return;
    }

    const text = inputText.trim();
    setInputText('');
    const optimisticMessage: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      sender: 'mentee',
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const newMessage = await chatService.sendMessage(id, text, 'mentee');
      setMessages((prev) =>
        prev.map((message) => (message.id === optimisticMessage.id ? newMessage : message))
      );

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      setInputText(text);
      console.error('Failed to send message:', error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMentee = item.sender === 'mentee';
    return (
      <View style={[styles.messageBubbleContainer, isMentee ? styles.menteeAlign : styles.mentorAlign]}>
        {!isMentee && conversation && (
          <Avatar uri={conversation.avatar} size={32} style={styles.bubbleAvatar} />
        )}
        <View style={[styles.bubble, isMentee ? styles.menteeBubble : styles.mentorBubble]}>
          <Typography variant="body" style={{ color: isMentee ? '#FFF' : theme.colors.text.primary }}>
            {item.text}
          </Typography>
          <Typography
            variant="caption"
            style={[
              styles.messageTime,
              { color: isMentee ? 'rgba(255,255,255,0.7)' : theme.colors.text.secondary },
            ]}
          >
            {formatDateTime(item.createdAt).split(' ')[0]}
          </Typography>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo}>
          <Avatar uri={conversation.avatar} size={40} />
          <View style={styles.headerTextWrapper}>
            <Typography variant="bodyMedium" weight="700">
              {conversation.name}
            </Typography>
            <Typography variant="caption" color="secondary">
              Đang hoạt động
            </Typography>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={
            session ? (
              <Card style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionIconWrapper}>
                    <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" weight="700">
                      Chi tiết buổi học
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      ID: {session.id}
                    </Typography>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: theme.colors.primaryLighter }]}>
                    <Typography variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      {session.status.toUpperCase()}
                    </Typography>
                  </View>
                </View>

                <View style={styles.sessionInfoGrid}>
                  <View style={styles.sessionInfoItem}>
                    <Typography variant="caption" color="secondary">Môn học</Typography>
                    <Typography variant="bodyMedium" numberOfLines={1}>{session.subject}</Typography>
                  </View>
                  <View style={styles.sessionInfoItem}>
                    <Typography variant="caption" color="secondary">Giá tiền</Typography>
                    <Typography variant="bodyMedium" weight="700">{formatCurrency(session.price)}</Typography>
                  </View>
                </View>

                <View style={[styles.sessionInfoItem, { marginTop: 12 }]}>
                  <Typography variant="caption" color="secondary">Thời gian</Typography>
                  <Typography variant="bodyMedium">
                    {formatDateTime(session.startTime)} - {formatDateTime(session.endTime).split(' ')[0]}
                  </Typography>
                </View>

                <View style={styles.sessionActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                    <Typography variant="label" color="error">Hủy bỏ</Typography>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.confirmButton]}>
                    <Typography variant="label" color="inverse">Xác nhận</Typography>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : null
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="add-circle-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={theme.colors.text.disabled}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerTextWrapper: {
    marginLeft: 12,
  },
  headerAction: {
    padding: 4,
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  mentorAlign: {
    alignSelf: 'flex-start',
  },
  menteeAlign: {
    alignSelf: 'flex-end',
  },
  bubbleAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mentorBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  menteeBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sessionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sessionInfoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionInfoItem: {
    flex: 1,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  attachmentButton: {
    padding: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 15,
    color: theme.colors.text.primary,
    paddingTop: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.text.disabled,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
