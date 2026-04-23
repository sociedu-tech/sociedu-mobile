import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { chatService } from '../../src/core/services/chatService';
import { ChatMessage, ChatSession, Conversation } from '../../src/core/types';

// ─── UTILS ───────────────────────────────────────────────────────

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    day: '2-digit', 
    month: '2-digit' 
  });
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN') + ' đ';
};

// ─── COMPONENT ───────────────────────────────────────────────────

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSessionPinned, setIsSessionPinned] = useState(true);
  
  // Load dữ liệu ban đầu
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allConvs = await chatService.getConversations();
      const currentConv = allConvs.find(c => c.id === id);
      
      if (currentConv) {
        setConversation(currentConv);
        const msgs = await chatService.getMessages(currentConv.id);
        setMessages(msgs);

        if (currentConv.sessionId) {
          const sess = await chatService.getChatSession(currentConv.sessionId);
          setSession(sess);
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !id) return;
    const text = inputText.trim();
    setInputText('');
    try {
      const newMessage = await chatService.sendMessage(id, text, 'mentee');
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleImagePick = async () => {
    const result = await require('expo-image-picker').launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && id) {
      // Giả lập gửi ảnh
      const imageMsg: ChatMessage = {
        id: Math.random().toString(),
        conversationId: id,
        sender: 'mentee',
        text: 'Đã gửi một ảnh',
        type: 'image',
        imageUrl: result.assets[0].uri,
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, imageMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMentee = item.sender === 'mentee';
    return (
      <View style={[styles.messageBubbleContainer, isMentee ? styles.menteeAlign : styles.mentorAlign]}>
        {!isMentee && conversation && (
          <Avatar uri={conversation.avatar} size={32} style={styles.bubbleAvatar} />
        )}
        <View style={[
          styles.bubble, 
          isMentee ? styles.menteeBubble : styles.mentorBubble,
          item.type === 'image' && styles.imageBubble
        ]}>
          {item.type === 'image' && item.imageUrl ? (
            <Image 
               source={{ uri: item.imageUrl }} 
               style={styles.messageImage} 
               resizeMode="cover" 
            />
          ) : (
            <Typography 
              variant="body" 
              style={{ color: isMentee ? '#FFF' : theme.colors.text.primary }}
            >
              {item.text}
            </Typography>
          )}
          <Typography 
            variant="caption" 
            style={[
              styles.messageTime, 
              { color: isMentee ? 'rgba(255,255,255,0.7)' : theme.colors.text.secondary }
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

  if (!conversation) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* HEADER */}
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
        
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={() => session && setIsSessionPinned(!isSessionPinned)}
        >
          <Ionicons 
            name={session ? "calendar" : "ellipsis-vertical"} 
            size={20} 
            color={session ? theme.colors.primary : theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          {/* PINNED SESSION CARD */}
          {session && isSessionPinned && (
            <Animated.View style={styles.pinnedSession}>
               <Card style={styles.sessionCardMini}>
                  <View style={styles.sessionHeaderMini}>
                    <Ionicons name="school" size={20} color={theme.colors.primary} />
                    <Typography variant="bodyMedium" weight="700" style={{ flex: 1, marginLeft: 8 }}>
                       {session.subject}
                    </Typography>
                    <TouchableOpacity onPress={() => setIsSessionPinned(false)}>
                       <Ionicons name="close" size={20} color={theme.colors.text.disabled} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.sessionFooterMini}>
                    <Typography variant="caption" color="secondary">
                       {formatDateTime(session.startTime)}
                    </Typography>
                    <TouchableOpacity style={styles.joinBtnMini} onPress={() => router.push(`/booking/${id}`)}>
                       <Typography variant="caption" style={{ color: '#FFF', fontWeight: '700' }}>Chi tiết</Typography>
                    </TouchableOpacity>
                  </View>
               </Card>
            </Animated.View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.messageList, session && isSessionPinned && { paddingTop: 100 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        </View>

        {/* INPUT AREA */}
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachmentButton} onPress={handleImagePick}>
            <Ionicons name="image-outline" size={26} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="document-attach-outline" size={26} color={theme.colors.primary} />
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
  pinnedSession: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 12,
  },
  sessionCardMini: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  sessionHeaderMini: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionFooterMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinBtnMini: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageBubble: {
    padding: 4,
    borderRadius: 12,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
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
    marginHorizontal: 4,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  textInput: {
    fontSize: 15,
    color: theme.colors.text.primary,
    paddingTop: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
