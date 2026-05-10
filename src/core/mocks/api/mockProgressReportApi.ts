import { CreateProgressReportRequest, ProgressReportResponseDTO, SubmitFeedbackRequest } from '../../types';
import { delay, withApiResponse } from '../utils';

const now = Date.now();

let mockProgressReports: ProgressReportResponseDTO[] = [
  {
    id: 'report_1',
    menteeId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
    menteeName: 'Nguyễn Văn Học Viên',
    mentorId: '1',
    bookingId: 'booking_1',
    title: 'Báo cáo tuần 1',
    content: 'Em đã hoàn thành phần cài đặt môi trường và làm quen với React Native cơ bản.',
    attachmentUrl: 'https://example.com/report-1.pdf',
    status: 'submitted',
    mentorFeedback: null,
    feedbackAt: null,
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'report_2',
    menteeId: '2',
    menteeName: 'Trần Thị B',
    mentorId: '1',
    bookingId: 'booking_2',
    title: 'Tiến độ dự án React',
    content: 'Em đã dựng được layout chính và hoàn thành kết nối API danh sách mentor.',
    attachmentUrl: null,
    status: 'reviewed',
    mentorFeedback: 'Tiến độ tốt, em tiếp tục hoàn thiện phần xử lý lỗi và loading state nhé.',
    feedbackAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'report_3',
    menteeId: '3',
    menteeName: 'Lê Minh Tâm',
    mentorId: '1',
    bookingId: 'booking_3',
    title: 'Báo cáo giữa kỳ',
    content: 'Em đang gặp khó khăn ở phần state management và cần thêm hướng dẫn về kiến trúc.',
    attachmentUrl: null,
    status: 'needs_revision',
    mentorFeedback: 'Em bổ sung thêm ví dụ cụ thể phần đang vướng và cập nhật lại sơ đồ luồng dữ liệu nhé.',
    feedbackAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function findReport(reportId: string) {
  return mockProgressReports.find((report) => report.id === reportId);
}

export const mockProgressReportApi = {
  getMyReports: async (userId?: string) => {
    await delay(300);
    const reports = userId
      ? mockProgressReports.filter((report) => report.mentorId === userId || report.menteeId === userId)
      : mockProgressReports;
    return withApiResponse(reports);
  },

  getById: async (reportId: string) => {
    await delay(250);
    const report = findReport(reportId);
    if (!report) {
      const error = new Error('Không tìm thấy báo cáo.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }
    return withApiResponse(report);
  },

  submitFeedback: async (
    reportId: string,
    feedback: string,
    status: SubmitFeedbackRequest['status'],
  ) => {
    await delay(300);
    const report = findReport(reportId);
    if (!report) {
      const error = new Error('Không tìm thấy báo cáo.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const updatedReport = {
      ...report,
      mentorFeedback: feedback,
      status,
      feedbackAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProgressReports = mockProgressReports.map((item) => (item.id === reportId ? updatedReport : item));
    return withApiResponse(updatedReport);
  },

  createReport: async (payload: CreateProgressReportRequest) => {
    await delay(300);
    const createdReport: ProgressReportResponseDTO = {
      id: `report_${Date.now()}`,
      menteeId: 'e34a621c-a90b-4bd2-bea4-23be5185ea93',
      menteeName: 'Nguyễn Văn Học Viên',
      mentorId: '1',
      bookingId: payload.bookingId,
      title: payload.title,
      content: payload.content,
      attachmentUrl: payload.attachmentUrl ?? null,
      status: 'submitted',
      mentorFeedback: null,
      feedbackAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProgressReports = [createdReport, ...mockProgressReports];
    return withApiResponse(createdReport);
  },
};
