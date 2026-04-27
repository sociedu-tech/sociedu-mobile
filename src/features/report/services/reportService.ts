import { api, unwrap } from '@/src/core/api';
import { API_PATHS } from '@/src/core/backend';
import { USE_MOCK } from '@/src/core/config';
import {
  Dispute,
  DisputeRequestDTO,
  DisputeResponseDTO,
  DisputeStatus,
  Report,
  ReportEntityType,
  ReportRequestDTO,
  ReportResponseDTO,
  ReportStatus,
} from '@/src/core/types';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toReportStatus(raw: string): ReportStatus {
  const map: Record<string, ReportStatus> = {
    OPEN: 'open',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
  };

  return map[raw?.toUpperCase()] ?? 'open';
}

function toReportEntityType(raw: string): ReportEntityType {
  const map: Record<string, ReportEntityType> = {
    USER: 'user',
    MESSAGE: 'message',
    BOOKING: 'booking',
    SESSION: 'session',
    REVIEW: 'review',
    COMMENT: 'comment',
  };

  return map[raw?.toUpperCase()] ?? 'user';
}

function toDisputeStatus(raw: string): DisputeStatus {
  const map: Record<string, DisputeStatus> = {
    OPEN: 'open',
    UNDER_REVIEW: 'under_review',
    RESOLVED_BUYER: 'resolved_buyer',
    RESOLVED_MENTOR: 'resolved_mentor',
    PARTIAL_REFUND: 'partial_refund',
    CLOSED: 'closed',
  };

  return map[raw?.toUpperCase()] ?? 'open';
}

function toReport(dto: ReportResponseDTO): Report {
  return {
    id: dto.id,
    reporterId: dto.reporterId,
    entityType: toReportEntityType(dto.entityType),
    entityId: dto.entityId,
    reason: dto.reason,
    description: dto.description,
    status: toReportStatus(dto.status),
    resolutionNote: dto.resolutionNote,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    evidences: (dto.evidences ?? []).map((evidence) => ({
      id: evidence.id,
      reportId: evidence.reportId,
      fileId: evidence.fileId,
      createdAt: evidence.createdAt,
    })),
  };
}

function toDispute(dto: DisputeResponseDTO): Dispute {
  return {
    id: dto.id,
    reportId: dto.reportId,
    bookingId: dto.bookingId,
    sessionId: dto.sessionId,
    openedBy: dto.openedBy,
    reason: dto.reason,
    description: dto.description,
    status: toDisputeStatus(dto.status),
    resolutionNote: dto.resolutionNote,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

const mockReports: Report[] = [];
const mockDisputes: Dispute[] = [];

export const reportService = {
  createReport: async (data: ReportRequestDTO): Promise<Report> => {
    if (USE_MOCK) {
      await delay(400);
      const newReport: Report = {
        id: `report-${Date.now()}`,
        reporterId: 'current-user',
        entityType: toReportEntityType(data.entityType),
        entityId: data.entityId,
        reason: data.reason,
        description: data.description,
        status: 'open',
        resolutionNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evidences: [],
      };
      mockReports.unshift(newReport);
      return newReport;
    }

    const res = await api.post<{ data: ReportResponseDTO }>(API_PATHS.reports.base, data);
    return toReport(unwrap(res));
  },

  getMyReports: async (): Promise<Report[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockReports;
    }

    const res = await api.get<{ data: ReportResponseDTO[] }>(API_PATHS.reports.mine);
    return unwrap(res).map(toReport);
  },

  createDispute: async (data: DisputeRequestDTO): Promise<Dispute> => {
    if (USE_MOCK) {
      await delay(400);
      const newDispute: Dispute = {
        id: `dispute-${Date.now()}`,
        reportId: data.reportId ?? null,
        bookingId: data.bookingId ?? null,
        sessionId: data.sessionId ?? null,
        openedBy: 'current-user',
        reason: data.reason,
        description: data.description,
        status: 'open',
        resolutionNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockDisputes.unshift(newDispute);
      return newDispute;
    }

    const res = await api.post<{ data: DisputeResponseDTO }>(API_PATHS.disputes.base, data);
    return toDispute(unwrap(res));
  },

  getMyDisputes: async (): Promise<Dispute[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockDisputes;
    }

    const res = await api.get<{ data: DisputeResponseDTO[] }>(API_PATHS.disputes.mine);
    return unwrap(res).map(toDispute);
  },
};
