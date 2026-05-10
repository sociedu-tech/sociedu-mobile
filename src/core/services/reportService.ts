import { ApiResponse, CreateReportRequest, Report, ReportResponseDTO } from '../types';
import { api } from '../api';

export const reportService = {
  /**
   * Gửi báo cáo vi phạm
   */
  async createReport(request: CreateReportRequest): Promise<Report> {
    const response = await api.post<ApiResponse<ReportResponseDTO>>('/reports', request);
    return this.toReport(response.data.data);
  },

  /**
   * Lấy danh sách báo cáo của tôi
   */
  async getMyReports(): Promise<Report[]> {
    const response = await api.get<ApiResponse<ReportResponseDTO[]>>('/reports/me');
    return response.data.data.map((dto: ReportResponseDTO) => this.toReport(dto));
  },

  /**
   * Adapter chuyển đổi từ DTO sang UI Model
   */
  toReport(dto: ReportResponseDTO): Report {
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
  },
};
