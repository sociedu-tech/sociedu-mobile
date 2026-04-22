import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_SESSIONS } from '../mocks/chatMocks';
import { Conversation, ChatMessage, ChatSession } from '../types';

/**
 * ChatService - Quản lý việc lấy dữ liệu hội thoại và tin nhắn.
 * Hiện tại sử dụng Mock Data, dễ dàng thay thế bằng API call (axios/fetch) sau này.
 */
class ChatService {
  /**
   * Lấy danh sách tất cả các cuộc hội thoại
   */
  async getConversations(): Promise<Conversation[]> {
    // Giả lập độ trễ mạng
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_CONVERSATIONS);
      }, 300);
    });
  }

  /**
   * Lấy danh sách tin nhắn của một cuộc hội thoại cụ thể
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_MESSAGES[conversationId] || []);
      }, 300);
    });
  }

  /**
   * Lấy thông tin phiên học (Session) đính kèm
   */
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_SESSIONS[sessionId] || null);
      }, 100);
    });
  }

  /**
   * Gửi tin nhắn mới
   */
  async sendMessage(conversationId: string, text: string, sender: 'mentee' | 'mentor'): Promise<ChatMessage> {
    return new Promise((resolve) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        conversationId,
        sender,
        text,
        createdAt: Date.now(),
      };
      // Lưu vào mock (trong thực tế sẽ call API POST)
      if (!MOCK_MESSAGES[conversationId]) {
        MOCK_MESSAGES[conversationId] = [];
      }
      MOCK_MESSAGES[conversationId].push(newMessage);
      
      setTimeout(() => {
        resolve(newMessage);
      }, 200);
    });
  }
}

export const chatService = new ChatService();
