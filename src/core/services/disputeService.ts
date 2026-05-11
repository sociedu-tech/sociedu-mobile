/**
 * disputeService.ts – Dispute domain service
 *
 * Endpoints:
 *   POST /disputes     → tạo khiếu nại
 *   GET  /disputes/me  → danh sách khiếu nại của tôi
 */
import { api, unwrap } from '../api';
import { USE_MOCK } from '../config';
import { mockDisputeApi } from '../mocks/api/mockReportDisputeApi';
import {
  ApiResponse,
  CreateDisputeRequest,
  Dispute,
  DisputeResponseDTO,
} from '../types';

function toDispute(dto: DisputeResponseDTO): Dispute {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    sessionId: dto.sessionId,
    reason: dto.reason,
    status: dto.status,
    resolutionNote: dto.resolutionNote,
    createdAt: new Date(dto.createdAt),
  };
}

export const disputeService = {
  /** Gửi khiếu nại (Dispute) */
  async createDispute(request: CreateDisputeRequest): Promise<Dispute> {
    const response = USE_MOCK
      ? await mockDisputeApi.createDispute(request)
      : await api.post<ApiResponse<DisputeResponseDTO>>('/disputes', request);

    return toDispute(unwrap(response));
  },

  /** Lấy danh sách khiếu nại của tôi */
  async getMyDisputes(): Promise<Dispute[]> {
    const response = USE_MOCK
      ? await mockDisputeApi.getMyDisputes()
      : await api.get<ApiResponse<DisputeResponseDTO[]>>('/disputes/me');

    return (unwrap(response) as DisputeResponseDTO[]).map(toDispute);
  },
};
