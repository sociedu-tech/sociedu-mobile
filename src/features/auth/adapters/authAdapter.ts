import { AuthResponseDTO, UserRole, VerificationStatus } from '@/src/core/types';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: UserRole[];
  effectiveRoles: UserRole[];
  userRole: UserRole;
  mentorVerificationStatus: VerificationStatus | null;
}

const ROLE_MAP: Record<string, UserRole> = {
  buyer: 'user',
  user: 'user',
  mentor: 'mentor',
  admin: 'admin',
};

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) {
    return null;
  }

  return ROLE_MAP[role.replace(/^ROLE_/, '').toLowerCase()] ?? null;
}

export function normalizeMentorVerificationStatus(
  status: string | null | undefined
): VerificationStatus | null {
  if (!status) {
    return null;
  }

  switch (status.toLowerCase()) {
    case 'verified':
    case 'approved':
      return 'verified';
    case 'pending':
    case 'pending_review':
      return 'pending';
    case 'rejected':
      return 'rejected';
    default:
      return null;
  }
}

function buildRoles(rawRoles: (string | UserRole)[]): UserRole[] {
  const mappedRoles = rawRoles
    .map((role) => normalizeRole(String(role)))
    .filter((role): role is UserRole => role !== null);

  const uniqueRoles = Array.from(new Set<UserRole>(mappedRoles));

  if (!uniqueRoles.includes('user')) {
    uniqueRoles.unshift('user');
  }

  return uniqueRoles;
}

export function getEffectiveRoles(
  roles: UserRole[],
  mentorVerificationStatus: VerificationStatus | null
): UserRole[] {
  return roles.filter((role) => role !== 'mentor' || mentorVerificationStatus === 'verified');
}

function pickDefaultRole(effectiveRoles: UserRole[], fallbackRole?: string | null): UserRole {
  const normalizedFallback = normalizeRole(fallbackRole);

  if (normalizedFallback && effectiveRoles.includes(normalizedFallback)) {
    return normalizedFallback;
  }

  if (effectiveRoles.includes('user')) {
    return 'user';
  }

  if (effectiveRoles.includes('mentor')) {
    return 'mentor';
  }

  if (effectiveRoles.includes('admin')) {
    return 'admin';
  }

  return 'user';
}

export function hydrateAuthUser(raw: Partial<AuthUser> | null | undefined): AuthUser | null {
  if (!raw || !raw.id || !raw.email) {
    return null;
  }

  const rolesSource =
    Array.isArray(raw.roles) && raw.roles.length > 0
      ? raw.roles
      : raw.userRole
        ? [raw.userRole]
        : ['user'];

  const roles = buildRoles(rolesSource);
  const mentorVerificationStatus = roles.includes('mentor')
    ? normalizeMentorVerificationStatus(raw.mentorVerificationStatus) ??
      (normalizeRole(raw.userRole) === 'mentor' ? 'verified' : 'pending')
    : null;
  const effectiveRoles = getEffectiveRoles(roles, mentorVerificationStatus);

  return {
    id: raw.id ?? '',
    email: raw.email ?? '',
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    fullName: raw.fullName ?? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
    roles,
    effectiveRoles,
    userRole: pickDefaultRole(effectiveRoles, raw.userRole),
    mentorVerificationStatus,
  };
}

export function toAuthUser(dto: AuthResponseDTO): AuthUser {
  const firstName = dto.firstName ?? '';
  const lastName = dto.lastName ?? '';
  const roles = buildRoles(dto.roles ?? []);
  const mentorVerificationStatus = roles.includes('mentor')
    ? normalizeMentorVerificationStatus(dto.mentorVerificationStatus) ?? 'pending'
    : null;
  const effectiveRoles = getEffectiveRoles(roles, mentorVerificationStatus);

  return {
    id: dto.userId,
    email: dto.email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    roles,
    effectiveRoles,
    userRole: pickDefaultRole(effectiveRoles),
    mentorVerificationStatus,
  };
}
