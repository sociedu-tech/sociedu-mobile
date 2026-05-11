/**
 * mockReportDisputeApi.ts – Mock API cho Report & Dispute
 *
 * Giả lập các endpoint:
 *   POST /reports       → tạo báo cáo vi phạm
 *   GET  /reports/me    → danh sách báo cáo của tôi
 *   POST /disputes      → tạo khiếu nại
 *   GET  /disputes/me   → danh sách khiếu nại của tôi
 */
import { delay, withApiResponse } from '../utils';
import {
  CreateReportRequest,
  CreateDisputeRequest,
  ReportResponseDTO,
  DisputeResponseDTO,
} from '../../types';

// ── In-memory storage ────────────────────────────────────────
const mockReports: ReportResponseDTO[] = [];
const mockDisputes: DisputeResponseDTO[] = [];

// ── Report Mock API ──────────────────────────────────────────
export const mockReportApi = {
  createReport: async (request: CreateReportRequest) => {
    await delay(800);

    const newReport: ReportResponseDTO = {
      id: `report-${Date.now()}`,
      reporterId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      targetType: request.targetType,
      targetId: request.targetId,
      reason: request.reason,
      description: request.description ?? null,
      status: 'open',
      evidenceFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockReports.push(newReport);
    return withApiResponse(newReport);
  },

  getMyReports: async () => {
    await delay(600);
    return withApiResponse(mockReports);
  },
};

// ── Dispute Mock API ─────────────────────────────────────────
export const mockDisputeApi = {
  createDispute: async (request: CreateDisputeRequest) => {
    await delay(800);

    const newDispute: DisputeResponseDTO = {
      id: `dispute-${Date.now()}`,
      reportId: request.reportId ?? null,
      bookingId: request.bookingId ?? null,
      sessionId: request.sessionId ?? null,
      reason: request.reason,
      status: 'open',
      resolutionNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDisputes.push(newDispute);
    return withApiResponse(newDispute);
  },

  getMyDisputes: async () => {
    await delay(600);
    return withApiResponse(mockDisputes);
  },
};
