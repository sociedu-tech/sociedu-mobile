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

interface BackendConversationDTO {
  id: string;
  type?: string | null;
  bookingId?: string | null;
  createdAt?: string | null;
}

interface BackendMessageDTO {
  id: string;
  senderId?: string | null;
  content?: string | null;
  type?: string | null;
  createdAt?: string | null;
}

const BASE = '/api/v1/chat';

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

function mapConversation(dto: BackendConversationDTO): Conversation {
  const createdAt = dto.createdAt ? new Date(dto.createdAt).getTime() : Date.now();

  return {
    id: dto.id,
    name: dto.bookingId ? `Conversation ${dto.bookingId.slice(0, 8)}` : 'Conversation',
    avatar: '',
    lastMessage: '',
    lastMessageTime: createdAt,
    unreadCount: 0,
    type: dto.bookingId ? 'session' : 'chat',
    sessionId: dto.bookingId ?? undefined,
  };
}

function mapMessage(dto: BackendMessageDTO): ChatMessage {
  return {
    id: dto.id,
    sender: dto.senderId ? 'mentor' : 'mentee',
    text: dto.content ?? '',
    createdAt: dto.createdAt ? new Date(dto.createdAt).getTime() : Date.now(),
  };
}

class ChatService {
  async getConversationPage(query: PageQuery = {}): Promise<PageResult<Conversation>> {
    if (USE_MOCK) {
      await delay(300);
      return paginate(MOCK_CONVERSATIONS, query);
    }

    const res = await api.get<{ data: BackendConversationDTO[] }>(`${BASE}/conversations`);
    return paginate(unwrap(res).map(mapConversation), query);
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

    const res = await api.get<{ data: BackendMessageDTO[] }>(
      `${BASE}/conversations/${conversationId}/messages`
    );
    return paginate(unwrap(res).map(mapMessage), query);
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

    return null;
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

    const res = await api.post<{ data: BackendMessageDTO }>(
      `${BASE}/conversations/${conversationId}/messages`,
      { content: text }
    );
    return mapMessage(unwrap(res));
  }

  async markConversationRead(_conversationId: string): Promise<void> {
    if (USE_MOCK) {
      return;
    }
  }

  async reportConversation(_conversationId: string, _reason: string): Promise<void> {
    if (USE_MOCK) {
      await delay(200);
      return;
    }

    throw new Error('Backend hien tai chua ho tro bao cao conversation tu mobile.');
  }
}

export const chatService = new ChatService();
