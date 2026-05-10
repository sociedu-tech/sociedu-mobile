/**
 * mentorAdapter.ts
 * Chuyển đổi MentorProfileResponseDTO (backend) -> User (mobile UI)
 */
import {
  CurriculumItem,
  CurriculumItemResponseDTO,
  MentorPackage,
  MentorPackageVersion,
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  ServicePackageVersionResponseDTO,
  User,
  VerificationStatus,
} from '../types';

function toCurriculumItem(dto: CurriculumItemResponseDTO): CurriculumItem {
  return {
    id: String(dto.id),
    title: dto.title ?? '',
    description: dto.description ?? '',
    orderIndex: dto.orderIndex ?? 0,
    duration: dto.duration ?? 0,
  };
}

function toPackageVersion(dto: ServicePackageVersionResponseDTO): MentorPackageVersion {
  return {
    id: String(dto.id),
    price: Number(dto.price),
    duration: dto.duration,
    deliveryType: dto.deliveryType ?? 'ONLINE',
    isDefault: dto.isDefault ?? false,
    isActive: dto.isActive ?? true,
    hasOrders: dto.hasOrders ?? false,
    isEditable: dto.isEditable ?? !(dto.hasOrders ?? false),
    curriculums: (dto.curriculums ?? []).map(toCurriculumItem),
  };
}

export function toPackage(dto: ServicePackageResponseDTO): MentorPackage {
  return {
    id: String(dto.id),
    title: dto.name,
    description: dto.description ?? '',
    isActive: dto.isActive ?? true,
    versions: (dto.versions ?? []).map(toPackageVersion),
  };
}

function toVerificationStatus(raw: string): VerificationStatus {
  const map: Record<string, VerificationStatus> = {
    VERIFIED: 'verified',
    PENDING: 'pending',
    REJECTED: 'rejected',
  };

  return map[raw?.toUpperCase()] ?? 'pending';
}

export function toMentorUser(dto: MentorProfileResponseDTO): User {
  const expertiseArr = dto.expertise
    ? dto.expertise
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const packages = (dto.packages ?? []).map(toPackage);
  const basePrice = Number(dto.basePrice ?? 0);

  return {
    id: String(dto.userId),
    name: '',
    email: '',
    avatar: null,
    roles: ['mentor'],
    activeRole: 'mentor',
    joinedDate: '',
    rating: dto.ratingAvg ?? 0,
    mentorInfo: {
      headline: dto.headline ?? '',
      expertise: expertiseArr,
      price: basePrice,
      rating: dto.ratingAvg ?? 0,
      sessionsCompleted: dto.sessionsCompleted ?? 0,
      verificationStatus: toVerificationStatus(dto.verificationStatus),
      packages,
    },
  };
}

export function toMentorList(dtos: MentorProfileResponseDTO[]): User[] {
  return (dtos ?? []).map(toMentorUser);
}
