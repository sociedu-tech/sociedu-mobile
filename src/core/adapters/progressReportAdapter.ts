import { ProgressReport, ProgressReportResponseDTO } from '../types';

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function toProgressReport(dto: ProgressReportResponseDTO): ProgressReport {
  return {
    id: dto.id,
    menteeId: dto.menteeId,
    menteeName: dto.menteeName,
    mentorId: dto.mentorId,
    bookingId: dto.bookingId,
    title: dto.title,
    content: dto.content,
    attachmentUrl: dto.attachmentUrl ?? null,
    status: dto.status,
    mentorFeedback: dto.mentorFeedback ?? null,
    feedbackAt: parseDate(dto.feedbackAt),
    createdAt: parseDate(dto.createdAt) ?? new Date(),
    updatedAt: parseDate(dto.updatedAt) ?? new Date(),
  };
}

export function toProgressReportList(dtos: ProgressReportResponseDTO[]): ProgressReport[] {
  return (dtos ?? []).map(toProgressReport);
}
