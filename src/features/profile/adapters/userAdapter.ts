import { API_BASE_URL } from '@/src/core/api';
import {
  User,
  UserCertificate,
  UserCertificateResponseDTO,
  UserEducation,
  UserEducationResponseDTO,
  UserExperience,
  UserExperienceResponseDTO,
  UserFullProfileResponseDTO,
  UserLanguage,
  UserLanguageResponseDTO,
  UserProfileResponseDTO,
} from '@/src/core/types';

function buildAvatarUrl(fileId: string | null | undefined): string | null {
  if (!fileId) {
    return null;
  }

  return `${API_BASE_URL}/api/v1/files/${fileId}`;
}

function toEducation(dto: UserEducationResponseDTO): UserEducation {
  return {
    id: dto.id,
    institution: dto.institution,
    degree: dto.degree,
    fieldOfStudy: dto.fieldOfStudy,
    startYear: dto.startYear,
    endYear: dto.endYear ?? null,
  };
}

function toExperience(dto: UserExperienceResponseDTO): UserExperience {
  return {
    id: dto.id,
    company: dto.company,
    role: dto.role,
    startDate: dto.startDate,
    endDate: dto.endDate ?? null,
    description: dto.description ?? null,
  };
}

function toLanguage(dto: UserLanguageResponseDTO): UserLanguage {
  return {
    id: dto.id,
    language: dto.language,
    proficiency: dto.proficiency,
  };
}

function toCertificate(dto: UserCertificateResponseDTO): UserCertificate {
  return {
    id: dto.id,
    name: dto.name,
    issuer: dto.issuer,
    issueDate: dto.issueDate,
    expiryDate: dto.expiryDate ?? null,
    credentialUrl: dto.credentialUrl ?? null,
  };
}

export function toUserFromProfile(dto: UserProfileResponseDTO): User {
  return {
    id: dto.userId,
    name: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim(),
    email: '',
    avatar: buildAvatarUrl(dto.avatarFileId),
    role: 'user',
    bio: dto.bio ?? undefined,
    headline: dto.headline ?? undefined,
    location: dto.location ?? undefined,
    joinedDate: dto.createdAt,
  };
}

export function toUserFull(dto: UserFullProfileResponseDTO): User {
  const base = toUserFromProfile(dto.profile);

  return {
    ...base,
    educations: (dto.educations ?? []).map(toEducation),
    experiences: (dto.experiences ?? []).map(toExperience),
    languages: (dto.languages ?? []).map(toLanguage),
    certificates: (dto.certificates ?? []).map(toCertificate),
  };
}
