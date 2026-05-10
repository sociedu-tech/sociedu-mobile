import { ApiResponse, CreateDisputeRequest, Dispute, DisputeResponseDTO } from '../types';
import { api } from '../api';

export const disputeService = {
  /**
   * Gửi khiếu nại (Dispute)
   */
  async createDispute(request: CreateDisputeRequest): Promise<Dispute> {
    const response = await api.post<ApiResponse<DisputeResponseDTO>>('/disputes', request);
    return this.toDispute(response.data.data);
  },

  /**
   * Lấy danh sách khiếu nại của tôi
   */
  async getMyDisputes(): Promise<Dispute[]> {
    const response = await api.get<ApiResponse<DisputeResponseDTO[]>>('/disputes/me');
    return response.data.data.map((dto: DisputeResponseDTO) => this.toDispute(dto));
  },

  /**
   * Adapter chuyển đổi từ DTO sang UI Model
   */
  toDispute(dto: DisputeResponseDTO): Dispute {
    return {
      id: dto.id,
      bookingId: dto.bookingId,
      sessionId: dto.sessionId,
      reason: dto.reason,
      status: dto.status,
      resolutionNote: dto.resolutionNote,
      createdAt: new Date(dto.createdAt),
    };
  },
};
