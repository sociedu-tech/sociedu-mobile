import { Conversation, ChatMessage, ChatSession } from '../types';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?u=a',
    lastMessage: 'Em muốn hỏi về buổi học ngày mai ạ',
    lastMessageTime: Date.now() - 1000 * 60 * 30,
    unreadCount: 1,
    type: 'chat',
    isPinned: true,
  },
  {
    id: 'conv_2',
    name: 'Dr. Lê Thị Bình',
    avatar: 'https://i.pravatar.cc/150?u=b',
    lastMessage: 'Xác nhận lịch hẹn lúc 2h chiều nay',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2,
    unreadCount: 0,
    type: 'session',
    sessionId: 'session_123',
    isPinned: false,
  },
  {
    id: 'conv_3',
    name: 'Trần Minh Tâm',
    avatar: 'https://i.pravatar.cc/150?u=c',
    lastMessage: 'Cảm ơn anh nhiều nhé!',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 24,
    unreadCount: 0,
    type: 'follow-up',
    isPinned: false,
  },
  {
    id: 'conv_4',
    name: 'Phạm Thành Long',
    avatar: 'https://i.pravatar.cc/150?u=l',
    lastMessage: 'Anh gửi lại tài liệu giúp em với',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 5,
    unreadCount: 3,
    type: 'chat',
    isPinned: false,
  },
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  conv_1: [
    { id: '1', conversationId: 'conv_1', sender: 'mentor', text: 'Chào em, anh có thể giúp gì cho em?', createdAt: Date.now() - 1000 * 60 * 60 },
    { id: '2', conversationId: 'conv_1', sender: 'mentee', text: 'Em muốn hỏi về buổi học ngày mai ạ', createdAt: Date.now() - 1000 * 60 * 30 },
    { id: '3', conversationId: 'conv_1', sender: 'mentor', text: 'Buổi học đó mình sẽ tập trung vào React Native nhé.', createdAt: Date.now() - 1000 * 60 * 25 },
  ],
  conv_2: [
    { id: '1', conversationId: 'conv_2', sender: 'mentor', text: 'Chào em, xác nhận lịch hẹn lúc 2h chiều nay nhé.', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
  ],
};

export const MOCK_SESSIONS: Record<string, ChatSession> = {
  session_123: {
    id: 'session_123',
    status: 'pending',
    mentorName: 'Dr. Lê Thị Bình',
    subject: 'Kỹ năng nghiên cứu khoa học',
    startTime: Date.now() + 1000 * 60 * 60 * 24,
    endTime: Date.now() + 1000 * 60 * 60 * 26,
    price: 300000,
  },
};
