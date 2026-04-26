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
} from '@/src/core/types';

function toCurriculumItem(dto: CurriculumItemResponseDTO): CurriculumItem {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description ?? '',
    orderIndex: dto.orderIndex,
    duration: dto.duration ?? 0,
  };
}

export function toMentorPackageVersion(dto: ServicePackageVersionResponseDTO): MentorPackageVersion {
  return {
    id: String(dto.id),
    price: Number(dto.price),
    duration: dto.duration,
    deliveryType: dto.deliveryType ?? 'ONLINE',
    isDefault: dto.isDefault ?? false,
    curriculums: (dto.curriculums ?? []).map(toCurriculumItem),
  };
}

export function toMentorPackage(dto: ServicePackageResponseDTO): MentorPackage {
  return {
    id: String(dto.id),
    title: dto.name,
    description: dto.description ?? '',
    isActive: dto.isActive ?? true,
    versions: (dto.versions ?? []).map(toMentorPackageVersion),
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
    ? dto.expertise.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const packages = (dto.packages ?? []).map(toMentorPackage);
  const allPrices = packages.flatMap((pkg) => pkg.versions.map((ver) => ver.price)).filter((price) => price > 0);
  const basePrice = allPrices.length > 0 ? Math.min(...allPrices) : Number(dto.basePrice ?? 0);

  return {
    id: String(dto.userId),
    name: dto.displayName ?? '',
    email: '',
    avatar: null,
    role: 'mentor',
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
