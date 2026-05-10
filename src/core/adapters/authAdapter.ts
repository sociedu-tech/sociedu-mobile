/**
 * authAdapter.ts
 * Chuyen doi AuthResponseDTO (backend) -> AuthUser (mobile store)
 */
import { AuthResponseDTO, UserRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: UserRole[];
  activeRole: UserRole;
}

/**
 * Normalize role: "ROLE_MENTOR" -> "mentor"
 */
function normalizeRole(role: string): UserRole | null {
  const normalized = role.replace(/^ROLE_/, '').toLowerCase();
  if (normalized === 'user' || normalized === 'buyer' || normalized === 'mentor' || normalized === 'admin') {
    return normalized;
  }
  return null;
}

/**
 * Chuyen AuthResponseDTO -> AuthUser
 */
export function toAuthUser(dto: AuthResponseDTO): AuthUser {
  const normalizedRoles = dto.roles.map(normalizeRole).filter((role): role is UserRole => role !== null);
  const firstName = dto.firstName ?? '';
  const lastName = dto.lastName ?? '';

  return {
    id: dto.userId,
    email: dto.email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    roles: normalizedRoles,
    activeRole: normalizedRoles[0] ?? 'user',
  };
}
