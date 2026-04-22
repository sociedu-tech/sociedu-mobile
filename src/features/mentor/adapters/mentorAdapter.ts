import {
  MentorPackage,
  MentorPackageVersion,
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  ServicePackageVersionResponseDTO,
  User,
  VerificationStatus,
} from '@/src/core/types';

function toPackageVersion(dto: ServicePackageVersionResponseDTO): MentorPackageVersion {
  return {
    id: String(dto.id),
    price: Number(dto.price),
    duration: dto.duration,
    deliveryType: dto.deliveryType ?? 'ONLINE',
    isDefault: dto.isDefault ?? false,
  };
}

function toPackage(dto: ServicePackageResponseDTO): MentorPackage {
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
    ? dto.expertise.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const packages = (dto.packages ?? []).map(toPackage);
  const allPrices = packages.flatMap((pkg) => pkg.versions.map((ver) => ver.price)).filter((price) => price > 0);
  const basePrice = allPrices.length > 0 ? Math.min(...allPrices) : Number(dto.basePrice ?? 0);

  return {
    id: String(dto.userId),
    name: '',
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
