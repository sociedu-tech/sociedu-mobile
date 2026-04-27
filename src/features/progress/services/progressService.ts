import { api, unwrap } from '@/src/core/api';
import { API_PATHS } from '@/src/core/backend';
import { USE_MOCK } from '@/src/core/config';
import {
  CreateProgressReportDTO,
  ProgressReport,
  ProgressReportResponseDTO,
  ProgressReportStatus,
} from '@/src/core/types';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toStatus(raw: string): ProgressReportStatus {
  const map: Record<string, ProgressReportStatus> = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
  };

  return map[raw?.toUpperCase()] ?? 'draft';
}

function toProgressReport(dto: ProgressReportResponseDTO): ProgressReport {
  return {
    id: dto.id,
    menteeId: dto.menteeId,
    mentorId: dto.mentorId,
    bookingId: dto.bookingId,
    title: dto.title,
    content: dto.content,
    attachmentUrl: dto.attachmentUrl,
    status: toStatus(dto.status),
    mentorFeedback: dto.mentorFeedback,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

const mockProgressReports: ProgressReport[] = [
  {
    id: 'progress-1',
    menteeId: 'user-1',
    mentorId: 'mentor-1',
    bookingId: 'booking-1',
    title: 'Tuần 1: Giới thiệu React Native',
    content: 'Đã học xong cơ bản về component, props và state. Hoàn thành bài tập counter app.',
    attachmentUrl: null,
    status: 'reviewed',
    mentorFeedback: 'Tốt lắm! Tiến bộ rõ rệt. Tuần tới sẽ học navigation và API calls.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'progress-2',
    menteeId: 'user-1',
    mentorId: 'mentor-1',
    bookingId: 'booking-1',
    title: 'Tuần 2: Navigation & API Integration',
    content: 'Hoàn thành navigation stack, học cách gọi API với Axios. Đang làm bài tập todo app.',
    attachmentUrl: null,
    status: 'submitted',
    mentorFeedback: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const progressService = {
  getMyReports: async (): Promise<ProgressReport[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockProgressReports;
    }

    const res = await api.get<{ data: ProgressReportResponseDTO[] }>(
      API_PATHS.progressReports.mine
    );
    return unwrap(res).map(toProgressReport);
  },

  getById: async (id: string): Promise<ProgressReport> => {
    if (USE_MOCK) {
      await delay(300);
      const found = mockProgressReports.find((report) => report.id === id);
      if (!found) {
        throw new Error('Không tìm thấy báo cáo tiến độ.');
      }
      return found;
    }

    const res = await api.get<{ data: ProgressReportResponseDTO }>(
      API_PATHS.progressReports.byId(id)
    );
    return toProgressReport(unwrap(res));
  },

  create: async (data: CreateProgressReportDTO): Promise<ProgressReport> => {
    if (USE_MOCK) {
      await delay(400);
      const newReport: ProgressReport = {
        id: `progress-${Date.now()}`,
        menteeId: 'current-user',
        mentorId: 'mentor-1',
        bookingId: data.bookingId ?? null,
        title: data.title,
        content: data.content,
        attachmentUrl: null,
        status: 'submitted',
        mentorFeedback: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProgressReports.unshift(newReport);
      return newReport;
    }

    const res = await api.post<{ data: ProgressReportResponseDTO }>(
      API_PATHS.progressReports.base,
      data
    );
    return toProgressReport(unwrap(res));
  },

  submitFeedback: async (reportId: string, feedback: string): Promise<ProgressReport> => {
    if (USE_MOCK) {
      await delay(400);
      const found = mockProgressReports.find((report) => report.id === reportId);
      if (!found) {
        throw new Error('Không tìm thấy báo cáo tiến độ.');
      }
      found.mentorFeedback = feedback;
      found.status = 'reviewed';
      found.updatedAt = new Date().toISOString();
      return found;
    }

    const res = await api.post<{ data: ProgressReportResponseDTO }>(
      API_PATHS.progressReports.feedback(reportId),
      { feedback }
    );
    return toProgressReport(unwrap(res));
  },
};
