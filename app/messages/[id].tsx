import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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

import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { bookingService } from '../../src/core/services/bookingService';
import { conversationService } from '../../src/core/services/conversationService';
import { useAuthStore } from '../../src/core/store/authStore';
import { Booking, Conversation, Message } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

function formatMessageTime(value: Date) {
  return value.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getMessageLabel(message: Message) {
  if (message.type === 'image') return TEXT.MESSAGES.SENT_IMAGE;
  if (message.type === 'file') return TEXT.MESSAGES.SENT_FILE;
  return message.content;
}

function getBookingStatusLabel(status: Booking['status']) {
  if (status === 'active') return TEXT.MESSAGES.STATUS_ONLINE;
  return TEXT.MESSAGES.STATUS_OFFLINE;
}

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList<Message>>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const loadConversation = useCallback(async () => {
    if (!id || !currentUserId) return;
    setLoading(true);
    setError(null);

    try {
      const [conversationData, messageData] = await Promise.all([
        conversationService.getConversationById(id, currentUserId),
        conversationService.getMessages(id, currentUserId),
      ]);

      setConversation(conversationData);
      setMessages(messageData);

      if (conversationData.type === 'booking' && conversationData.bookingId) {
        try {
          setBooking(await bookingService.getById(conversationData.bookingId));
        } catch {
          setBooking(null);
        }
      } else {
        setBooking(null);
      }
    } catch (loadError: any) {
      setError(loadError?.message || TEXT.MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, id]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const handleSend = useCallback(async () => {
    if (!id || !currentUserId || !inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const createdMessage = await conversationService.sendMessage(id, text, currentUserId);
      setMessages((currentMessages) => [...currentMessages, createdMessage]);
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    } catch (sendError: any) {
      Alert.alert(TEXT.COMMON.ERROR, sendError?.message || TEXT.MESSAGES.SEND_ERROR);
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [currentUserId, id, inputText, sending]);

  const messageList = useMemo(
    () => messages.sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime()),
    [messages],
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.isMine ? styles.mineRow : styles.peerRow]}>
      {!item.isMine ? <Avatar uri={conversation?.avatar ?? undefined} size={32} /> : null}
      <View style={[styles.messageBubble, item.isMine ? styles.mineBubble : styles.peerBubble]}>
        {item.type === 'image' && item.attachments[0]?.url ? (
          <Image resizeMode="cover" source={{ uri: item.attachments[0].url }} style={styles.messageImage} />
        ) : (
          <Typography
            style={{ color: item.isMine ? theme.colors.text.inverse : theme.colors.text.primary }}
            variant="body"
          >
            {getMessageLabel(item)}
          </Typography>
        )}
        <Typography
          style={[styles.messageTime, { color: item.isMine ? theme.colors.primaryLight : theme.colors.text.secondary }]}
          variant="caption"
        >
          {formatMessageTime(item.createdAt)}
        </Typography>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingState message={TEXT.COMMON.LOADING} />;
  }

  if (error || !conversation) {
    return <ErrorState error={error || TEXT.MESSAGES.LOAD_ERROR} onRetry={() => loadConversation()} />;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={theme.colors.text.primary} name="arrow-back" size={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Avatar uri={conversation.avatar ?? undefined} size={40} />
          <View style={styles.headerText}>
            <Typography style={styles.headerName} variant="bodyMedium">
              {conversation.name}
            </Typography>
            <Typography color="secondary" variant="caption">
              {/* Presence is not wired yet, so show the peer as online until real-time status exists. */}
              {TEXT.MESSAGES.STATUS_ONLINE}
            </Typography>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {conversation.type === 'booking' && booking ? (
          <Card style={styles.bookingCard}>
            <Typography style={styles.bookingTitle} variant="bodyMedium">
              {TEXT.MESSAGES.BOOKING_INFO_TITLE}
            </Typography>
            <Typography color="secondary" variant="caption">
              {getBookingStatusLabel(booking.status)}
            </Typography>
            <Typography style={styles.bookingMeta} variant="caption">
              {`${booking.sessions.length} buổi học`}
            </Typography>
            <TouchableOpacity onPress={() => router.push(`/booking/${booking.id}` as any)} style={styles.bookingLink}>
              <Typography style={styles.bookingLinkText} variant="caption">
                {TEXT.MESSAGES.VIEW_BOOKING}
              </Typography>
              <Ionicons color={theme.colors.primary} name="chevron-forward" size={16} />
            </TouchableOpacity>
          </Card>
        ) : null}

        <FlatList
          ref={flatListRef}
          contentContainerStyle={styles.messageList}
          data={messageList}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={renderMessage}
        />

        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <TextInput
              multiline
              onChangeText={setInputText}
              placeholder={TEXT.MESSAGES.INPUT_PLACEHOLDER}
              placeholderTextColor={theme.colors.text.disabled}
              style={styles.input}
              value={inputText}
            />
          </View>
          <TouchableOpacity
            disabled={!inputText.trim() || sending}
            onPress={handleSend}
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          >
            <Ionicons color={theme.colors.text.inverse} name="send" size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  iconButton: { padding: theme.spacing.xs },
  headerInfo: { alignItems: 'center', flex: 1, flexDirection: 'row', marginLeft: theme.spacing.sm },
  headerText: { marginLeft: theme.spacing.sm },
  headerName: { fontWeight: '700' },
  bookingCard: { borderRadius: theme.borderRadius.lg, margin: theme.spacing.md, padding: theme.spacing.md },
  bookingTitle: { fontWeight: '700', marginBottom: theme.spacing.xs },
  bookingMeta: { color: theme.colors.text.secondary, marginTop: theme.spacing.xs },
  bookingLink: { alignItems: 'center', flexDirection: 'row', marginTop: theme.spacing.sm },
  bookingLinkText: { color: theme.colors.primary, fontWeight: '700', marginRight: theme.spacing.xs },
  messageList: { padding: theme.spacing.md },
  messageRow: { alignItems: 'flex-end', flexDirection: 'row', marginBottom: theme.spacing.md, maxWidth: '85%' },
  peerRow: { alignSelf: 'flex-start' },
  mineRow: { alignSelf: 'flex-end' },
  messageBubble: { borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  peerBubble: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderWidth: 1,
    marginLeft: theme.spacing.sm,
  },
  mineBubble: { backgroundColor: theme.colors.primary },
  messageImage: { borderRadius: theme.borderRadius.md, height: 150, width: 220 },
  messageTime: { alignSelf: 'flex-end', marginTop: theme.spacing.xs },
  inputBar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border.default,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: theme.spacing.sm,
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    flex: 1,
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  input: { color: theme.colors.text.primary, maxHeight: 100, minHeight: 40, paddingVertical: theme.spacing.sm },
  sendButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButtonDisabled: { backgroundColor: theme.colors.text.disabled },
});
