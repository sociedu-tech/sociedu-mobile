import { ConversationResponseDTO, MessageResponseDTO } from '../types';
import { delay, withApiResponse } from './utils';

const now = Date.now();

let mockConversations: ConversationResponseDTO[] = [
  {
    id: 'conv_booking_1',
    type: 'booking',
    bookingId: 'booking_1',
    participants: [
      { userId: '1', name: 'Mentor Hoàng Minh', avatarUrl: 'https://i.pravatar.cc/150?u=mentor-1' },
      {
        userId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
        name: 'Nguyễn Văn Học Viên',
        avatarUrl: 'https://i.pravatar.cc/150?u=mentee-1',
      },
    ],
    lastMessage: {
      text: 'Em đã cập nhật tiến độ sau buổi học hôm qua ạ.',
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      senderId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
    },
    unreadCount: 2,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'conv_general_1',
    type: 'general',
    bookingId: null,
    participants: [
      { userId: '1', name: 'Mentor Hoàng Minh', avatarUrl: 'https://i.pravatar.cc/150?u=mentor-1' },
      { userId: '2', name: 'Trần Thị B', avatarUrl: 'https://i.pravatar.cc/150?u=mentee-2' },
    ],
    lastMessage: {
      text: 'Em muốn hỏi thêm về lộ trình học frontend.',
      createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      senderId: '2',
    },
    unreadCount: 0,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'conv_support_1',
    type: 'support',
    bookingId: null,
    participants: [
      { userId: '1', name: 'Mentor Hoàng Minh', avatarUrl: 'https://i.pravatar.cc/150?u=mentor-1' },
      { userId: 'support_1', name: 'Hỗ trợ Sociedu', avatarUrl: null },
    ],
    lastMessage: {
      text: 'Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn.',
      createdAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
      senderId: 'support_1',
    },
    unreadCount: 1,
    createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
  },
];

let mockMessages: Record<string, MessageResponseDTO[]> = {
  conv_booking_1: [
    {
      id: 'message_1',
      conversationId: 'conv_booking_1',
      senderId: '1',
      type: 'text',
      content: 'Chào em, buổi tới mình sẽ review phần bài tập React Native nhé.',
      attachments: [],
      isEdited: false,
      createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'message_2',
      conversationId: 'conv_booking_1',
      senderId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      type: 'image',
      content: '',
      attachments: [
        {
          id: 'attachment_1',
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
          type: 'image/jpeg',
        },
      ],
      isEdited: false,
      createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
    },
    {
      id: 'message_3',
      conversationId: 'conv_booking_1',
      senderId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      type: 'text',
      content: 'Em đã cập nhật tiến độ sau buổi học hôm qua ạ.',
      attachments: [],
      isEdited: false,
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
    },
  ],
  conv_general_1: [
    {
      id: 'message_4',
      conversationId: 'conv_general_1',
      senderId: '2',
      type: 'text',
      content: 'Em muốn hỏi thêm về lộ trình học frontend.',
      attachments: [],
      isEdited: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    },
  ],
  conv_support_1: [
    {
      id: 'message_5',
      conversationId: 'conv_support_1',
      senderId: 'support_1',
      type: 'system',
      content: 'Yêu cầu hỗ trợ của bạn đã được tạo thành công.',
      attachments: [],
      isEdited: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'message_6',
      conversationId: 'conv_support_1',
      senderId: 'support_1',
      type: 'text',
      content: 'Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn.',
      attachments: [],
      isEdited: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
    },
  ],
};

function updateConversationPreview(conversationId: string, message: MessageResponseDTO) {
  mockConversations = mockConversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: {
            text: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
          },
          updatedAt: message.createdAt,
        }
      : conversation,
  );
}

export const mockConversationApi = {
  getMyConversations: async () => {
    await delay(250);
    return withApiResponse(mockConversations);
  },

  getConversationById: async (conversationId: string) => {
    await delay(250);
    const conversation = mockConversations.find((item) => item.id === conversationId);
    if (!conversation) {
      const error = new Error('Không tìm thấy cuộc hội thoại.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }
    return withApiResponse(conversation);
  },

  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    await delay(250);
    const messages = mockMessages[conversationId];
    if (!messages) {
      const error = new Error('Không tìm thấy tin nhắn.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }
    const offset = (page - 1) * limit;
    return withApiResponse(messages.slice(offset, offset + limit));
  },

  sendMessage: async (
    conversationId: string,
    text: string,
    attachments: { url: string; type: string }[] = [],
  ) => {
    await delay(200);
    const conversation = mockConversations.find((item) => item.id === conversationId);
    if (!conversation) {
      const error = new Error('Không tìm thấy cuộc hội thoại.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const message: MessageResponseDTO = {
      id: `message_${Date.now()}`,
      conversationId,
      senderId: conversation.participants[0]?.userId ?? '1',
      type: attachments.length > 0 ? 'image' : 'text',
      content: text,
      attachments: attachments.map((attachment, index) => ({
        id: `attachment_${Date.now()}_${index}`,
        url: attachment.url,
        type: attachment.type,
      })),
      isEdited: false,
      createdAt: new Date().toISOString(),
    };

    mockMessages[conversationId] = [...(mockMessages[conversationId] ?? []), message];
    updateConversationPreview(conversationId, message);
    return withApiResponse(message);
  },

  createConversation: async (
    participantIds: string[],
    type: ConversationResponseDTO['type'],
    bookingId?: string,
  ) => {
    await delay(250);
    const createdConversation: ConversationResponseDTO = {
      id: `conv_${Date.now()}`,
      type,
      bookingId: bookingId ?? null,
      participants: [
        { userId: '1', name: 'Mentor Hoàng Minh', avatarUrl: 'https://i.pravatar.cc/150?u=mentor-1' },
        ...participantIds.map((participantId, index) => ({
          userId: participantId,
          name: `Người dùng ${index + 1}`,
          avatarUrl: `https://i.pravatar.cc/150?u=${participantId}`,
        })),
      ],
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockConversations = [createdConversation, ...mockConversations];
    mockMessages[createdConversation.id] = [];
    return withApiResponse(createdConversation);
  },
};
