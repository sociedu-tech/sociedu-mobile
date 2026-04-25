import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_SESSIONS } from '@/src/core/mocks/chatMocks';
import { ChatMessage, ChatSession, Conversation } from '@/src/core/types';

interface PageQuery {
  page?: number;
  pageSize?: number;
}

interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

const BASE = '/api/v1/messages';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paginate<T>(items: T[], query: PageQuery = {}): PageResult<T> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 30;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
    hasNextPage: start + pageSize < items.length,
  };
}

class ChatService {
  async getConversationPage(query: PageQuery = {}): Promise<PageResult<Conversation>> {
    if (USE_MOCK) {
      await delay(300);
      return paginate(MOCK_CONVERSATIONS, query);
    }

    const res = await api.get<{ data: PageResult<Conversation> }>(`${BASE}/conversations`, {
      params: query,
    });
    return unwrap(res);
  }

  async getConversations(): Promise<Conversation[]> {
    const result = await this.getConversationPage({ page: 1, pageSize: 50 });
    return result.items;
  }

  async getMessagePage(conversationId: string, query: PageQuery = {}): Promise<PageResult<ChatMessage>> {
    if (USE_MOCK) {
      await delay(300);
      return paginate(MOCK_MESSAGES[conversationId] || [], query);
    }

    const res = await api.get<{ data: PageResult<ChatMessage> }>(
      `${BASE}/conversations/${conversationId}/messages`,
      { params: query }
    );
    return unwrap(res);
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const result = await this.getMessagePage(conversationId, { page: 1, pageSize: 50 });
    return result.items;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    if (USE_MOCK) {
      await delay(100);
      return MOCK_SESSIONS[sessionId] || null;
    }

    const res = await api.get<{ data: ChatSession | null }>(`${BASE}/sessions/${sessionId}`);
    return unwrap(res);
  }

  async sendMessage(
    conversationId: string,
    text: string,
    sender: 'mentee' | 'mentor'
  ): Promise<ChatMessage> {
    if (USE_MOCK) {
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

      await delay(200);
      return newMessage;
    }

    const res = await api.post<{ data: ChatMessage }>(
      `${BASE}/conversations/${conversationId}/messages`,
      { text }
    );
    return unwrap(res);
  }

  async markConversationRead(conversationId: string): Promise<void> {
    if (USE_MOCK) {
      const conversation = MOCK_CONVERSATIONS.find((item) => item.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
      return;
    }

    await api.post(`${BASE}/conversations/${conversationId}/read`);
  }

  async reportConversation(conversationId: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      await delay(200);
      return;
    }

    await api.post(`${BASE}/conversations/${conversationId}/report`, { reason });
  }
}

export const chatService = new ChatService();
