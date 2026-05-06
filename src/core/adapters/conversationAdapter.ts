import {
  Conversation,
  ConversationParticipant,
  ConversationResponseDTO,
  Message,
  MessageResponseDTO,
} from '../types';

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function toParticipant(
  participant: ConversationResponseDTO['participants'][number],
  currentUserId?: string,
): ConversationParticipant {
  return {
    id: participant.userId,
    name: participant.name,
    avatarUrl: participant.avatarUrl,
    isCurrentUser: participant.userId === currentUserId,
  };
}

export function toConversation(
  dto: ConversationResponseDTO,
  currentUserId?: string,
): Conversation {
  const participants = (dto.participants ?? []).map((item) => toParticipant(item, currentUserId));
  const peer = participants.find((item) => !item.isCurrentUser) ?? participants[0] ?? null;

  return {
    id: dto.id,
    type: dto.type,
    bookingId: dto.bookingId ?? null,
    participants,
    peer,
    name: peer?.name ?? 'Cuộc hội thoại',
    avatar: peer?.avatarUrl ?? null,
    lastMessage: dto.lastMessage
      ? {
          text: dto.lastMessage.text,
          createdAt: toDate(dto.lastMessage.createdAt),
          senderId: dto.lastMessage.senderId,
        }
      : null,
    lastMessageText: dto.lastMessage?.text ?? '',
    lastMessageAt: toDate(dto.lastMessage?.createdAt),
    unreadCount: dto.unreadCount ?? 0,
    createdAt: toDate(dto.createdAt) ?? new Date(),
    updatedAt: toDate(dto.updatedAt) ?? new Date(),
  };
}

export function toConversationList(
  dtos: ConversationResponseDTO[],
  currentUserId?: string,
): Conversation[] {
  return (dtos ?? []).map((dto) => toConversation(dto, currentUserId));
}

export function toMessage(dto: MessageResponseDTO, currentUserId?: string): Message {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    senderId: dto.senderId,
    type: dto.type,
    content: dto.content,
    attachments: (dto.attachments ?? []).map((attachment) => ({
      id: attachment.id,
      url: attachment.url,
      type: attachment.type,
    })),
    isEdited: dto.isEdited ?? false,
    createdAt: toDate(dto.createdAt) ?? new Date(),
    isMine: dto.senderId === currentUserId,
  };
}

export function toMessageList(dtos: MessageResponseDTO[], currentUserId?: string): Message[] {
  return (dtos ?? []).map((dto) => toMessage(dto, currentUserId));
}
