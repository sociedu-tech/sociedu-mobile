/**
 * mentorAdapter.ts
 * Chuyển đổi MentorProfileResponseDTO (backend) → User (mobile UI)
 *
 * Các transform chính:
 *   - expertise: "React,Node.js" → ["React", "Node.js"]
 *   - userId: number → id: string
 *   - ratingAvg: Float|null → rating: number
 *   - verificationStatus: "VERIFIED" → "verified"
 *   - packages: ServicePackageResponseDTO[] → MentorPackage[]
 */
import {
  MentorProfileResponseDTO,
  ServicePackageResponseDTO,
  ServicePackageVersionResponseDTO,
  CurriculumItemResponseDTO,
  User,
  MentorPackage,
  MentorPackageVersion,
  CurriculumItem,
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

/**
 * Chuyển MentorProfileResponseDTO → User (mobile type)
 */
export function toMentorUser(dto: MentorProfileResponseDTO): User {
  const expertiseArr = dto.expertise
    ? dto.expertise.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const packages = (dto.packages ?? []).map(toPackage);
  // Giá thấp nhất trong tất cả các version
  const allPrices = packages
    .flatMap((p) => p.versions.map((v) => v.price))
    .filter((p) => p > 0);
  const basePrice = allPrices.length > 0 ? Math.min(...allPrices) : Number(dto.basePrice ?? 0);

  return {
    id: String(dto.userId),
    name: '',                  // Không có tên trong MentorProfileResponse → cần public user API
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

/**
 * Chuyển danh sách
 */
export function toMentorList(dtos: MentorProfileResponseDTO[]): User[] {
  return (dtos ?? []).map(toMentorUser);
}
