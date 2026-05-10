import { api, unwrap } from '../api';
import { toProgressReport, toProgressReportList } from '../adapters/progressReportAdapter';
import { API_PATHS } from '../backend';
import { USE_MOCK } from '../config';
import { mockProgressReportApi } from '../mocks/api/mockProgressReportApi';
import { useAuthStore } from '../store/authStore';
import {
  CreateProgressReportRequest,
  ProgressReport,
  ProgressReportResponseDTO,
  SubmitFeedbackRequest,
} from '../types';

export const progressReportService = {
  getMyReports: async (): Promise<ProgressReport[]> => {
    const activeMode = useAuthStore.getState().activeMode;
    const response = USE_MOCK
      ? await mockProgressReportApi.getMyReports(activeMode)
      : await api.get<{ data: ProgressReportResponseDTO[] }>(API_PATHS.progressReports.list);

    return toProgressReportList(unwrap(response));
  },

  getMenteeReports: async (): Promise<ProgressReport[]> => {
    return progressReportService.getMyReports();
  },

  getReportById: async (id: string): Promise<ProgressReport> => {
    const response = USE_MOCK
      ? await mockProgressReportApi.getById(id)
      : await api.get<{ data: ProgressReportResponseDTO }>(API_PATHS.progressReports.byId(id));

    return toProgressReport(unwrap(response));
  },

  submitFeedback: async (
    reportId: string,
    feedback: string,
    status: SubmitFeedbackRequest['status'],
  ): Promise<ProgressReport> => {
    const response = USE_MOCK
      ? await mockProgressReportApi.submitFeedback(reportId, feedback, status)
      : await api.post<{ data: ProgressReportResponseDTO }>(API_PATHS.progressReports.feedback(reportId), {
          feedback,
          status,
        });

    return toProgressReport(unwrap(response));
  },

  createReport: async (payload: CreateProgressReportRequest): Promise<ProgressReport> => {
    const response = USE_MOCK
      ? await mockProgressReportApi.createReport(payload)
      : await api.post<{ data: ProgressReportResponseDTO }>(API_PATHS.progressReports.create, payload);

    return toProgressReport(unwrap(response));
  },
};
