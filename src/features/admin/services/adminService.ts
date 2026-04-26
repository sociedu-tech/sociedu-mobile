import { api, unwrap } from '@/src/core/api';
import { USE_MOCK } from '@/src/core/config';

export interface MentorModerationItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  headline: string;
  expertise: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorName: string;
  targetName: string;
  createdAt: string;
}

interface BackendAdminUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles?: string[] | null;
}

const BASE = '/api/v1/admin';

const mockPendingMentors: MentorModerationItem[] = [
  {
    id: 'moderation-1',
    userId: 'mentor-1001',
    name: 'Nguyen Minh Anh',
    email: 'minhanh@example.com',
    headline: 'React Native mentor',
    expertise: ['React Native', 'Expo'],
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'pending',
  },
  {
    id: 'moderation-2',
    userId: 'mentor-1002',
    name: 'Tran Hoang Long',
    email: 'long.tran@example.com',
    headline: 'Backend and system design mentor',
    expertise: ['Node.js', 'System Design'],
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    status: 'pending',
  },
];

const mockAuditLogs: AuditLogItem[] = [];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pushAudit(action: string, targetName: string) {
  mockAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    action,
    actorName: 'Admin',
    targetName,
    createdAt: new Date().toISOString(),
  });
}

export const adminService = {
  getMentorModerationQueue: async (): Promise<MentorModerationItem[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockPendingMentors.filter((item) => item.status === 'pending');
    }

    const res = await api.get<{ data: BackendAdminUser[] }>(`${BASE}/users`);
    const users = unwrap(res);

    return users
      .filter((user) => !(user.roles ?? []).some((role) => role?.toUpperCase().includes('MENTOR')))
      .map((user) => ({
        id: user.id,
        userId: user.id,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'Unknown user',
        email: user.email ?? '',
        headline: 'Backend hien tai chua cung cap ho so moderation cho mentor.',
        expertise: [],
        submittedAt: new Date().toISOString(),
        status: 'pending' as const,
      }));
  },

  approveMentor: async (moderationId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(350);
      const item = mockPendingMentors.find((mentor) => mentor.id === moderationId);
      if (item) {
        item.status = 'approved';
        pushAudit('APPROVE_MENTOR', item.name);
      }
      return;
    }

    await api.patch(`${BASE}/users/${moderationId}/role`, { role: 'MENTOR' });
  },

  rejectMentor: async (moderationId: string, reason: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(350);
      const item = mockPendingMentors.find((mentor) => mentor.id === moderationId);
      if (item) {
        item.status = 'rejected';
        pushAudit(`REJECT_MENTOR: ${reason}`, item.name);
      }
      return;
    }

    await api.patch(`${BASE}/users/${moderationId}/role`, { role: 'USER' });
  },

  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    if (USE_MOCK) {
      await delay(250);
      return mockAuditLogs;
    }

    return [];
  },
};
