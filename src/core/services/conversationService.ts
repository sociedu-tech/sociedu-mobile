import { api, unwrap } from '../api';
import { toConversation, toConversationList, toMessage, toMessageList } from '../adapters/conversationAdapter';
import { API_PATHS } from '../backend';
import { USE_MOCK } from '../config';
import { mockConversationApi } from '../mocks/chatMocks';
import { Conversation, ConversationResponseDTO, Message, MessageResponseDTO } from '../types';

export const conversationService = {
  getMyConversations: async (userId?: string): Promise<Conversation[]> => {
    const response = USE_MOCK
      ? await mockConversationApi.getMyConversations()
      : await api.get<{ data: ConversationResponseDTO[] }>(API_PATHS.conversations.list);

    return toConversationList(unwrap(response), userId);
  },

  getConversationById: async (id: string, userId?: string): Promise<Conversation> => {
    const response = USE_MOCK
      ? await mockConversationApi.getConversationById(id)
      : await api.get<{ data: ConversationResponseDTO }>(API_PATHS.conversations.byId(id));

    return toConversation(unwrap(response), userId);
  },

  getMessages: async (conversationId: string, userId?: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = USE_MOCK
      ? await mockConversationApi.getMessages(conversationId, page, limit)
      : await api.get<{ data: MessageResponseDTO[] }>(API_PATHS.conversations.messages(conversationId), {
          params: { page, limit },
        });

    return toMessageList(unwrap(response), userId);
  },

  sendMessage: async (
    conversationId: string,
    text: string,
    userId?: string,
    attachments: { url: string; type: string }[] = [],
  ): Promise<Message> => {
    const response = USE_MOCK
      ? await mockConversationApi.sendMessage(conversationId, text, attachments)
      : await api.post<{ data: MessageResponseDTO }>(API_PATHS.conversations.messages(conversationId), {
          content: text,
          attachments,
        });

    return toMessage(unwrap(response), userId);
  },

  createConversation: async (
    participantIds: string[],
    type: ConversationResponseDTO['type'],
    userId?: string,
    bookingId?: string,
  ): Promise<Conversation> => {
    const response = USE_MOCK
      ? await mockConversationApi.createConversation(participantIds, type, bookingId)
      : await api.post<{ data: ConversationResponseDTO }>(API_PATHS.conversations.list, {
          participantIds,
          type,
          bookingId: bookingId ?? null,
        });

    return toConversation(unwrap(response), userId);
  },
};
