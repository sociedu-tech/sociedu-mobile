import { ChatMessage, ChatSession, Conversation } from '@/src/core/types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_SESSIONS } from '@/src/core/mocks/chatMocks';

class ChatService {
  async getConversations(): Promise<Conversation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_CONVERSATIONS);
      }, 300);
    });
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_MESSAGES[conversationId] || []);
      }, 300);
    });
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_SESSIONS[sessionId] || null);
      }, 100);
    });
  }

  async sendMessage(
    conversationId: string,
    text: string,
    sender: 'mentee' | 'mentor'
  ): Promise<ChatMessage> {
    return new Promise((resolve) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender,
        text,
        createdAt: Date.now(),
      };

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
