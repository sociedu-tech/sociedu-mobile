/**
 * reportService.ts – Report domain service
 *
 * Endpoints:
 *   POST /reports     → tạo báo cáo vi phạm
 *   GET  /reports/me  → danh sách báo cáo của tôi
 */
import { api, unwrap } from '../api';
import { USE_MOCK } from '../config';
import { mockReportApi } from '../mocks/api/mockReportDisputeApi';
import {
  ApiResponse,
  CreateReportRequest,
  Report,
  ReportResponseDTO,
} from '../types';

function toReport(dto: ReportResponseDTO): Report {
  return {
    id: dto.id,
    targetType: dto.targetType,
    targetId: dto.targetId,
    reason: dto.reason,
    description: dto.description,
    status: dto.status,
    evidenceFiles: dto.evidenceFiles.map((f) => ({
      id: f.id,
      type: f.type,
      url: f.url,
      uploadedAt: f.uploadedAt,
    })),
    createdAt: new Date(dto.createdAt),
  };
}

export const reportService = {
  /** Gửi báo cáo vi phạm */
  async createReport(request: CreateReportRequest): Promise<Report> {
    const response = USE_MOCK
      ? await mockReportApi.createReport(request)
      : await api.post<ApiResponse<ReportResponseDTO>>('/reports', request);

    return toReport(unwrap(response));
  },

  /** Lấy danh sách báo cáo của tôi */
  async getMyReports(): Promise<Report[]> {
    const response = USE_MOCK
      ? await mockReportApi.getMyReports()
      : await api.get<ApiResponse<ReportResponseDTO[]>>('/reports/me');

    return (unwrap(response) as ReportResponseDTO[]).map(toReport);
  },
};
