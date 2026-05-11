/**
 * authAdapter.ts
 * Chuyển đổi AuthResponseDTO (backend) → AuthUser (mobile store)
 */
import { AuthResponseDTO } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline?: string;
  roles: string[];           // lowercase, ROLE_ prefix stripped
  userRole: string;          // role chính (phần tử đầu tiên)
}

/**
 * Normalize role: "ROLE_MENTOR" → "mentor"
 */
function normalizeRole(role: string): string {
  return role.replace(/^ROLE_/, '').toLowerCase();
}

/**
 * Chuyển AuthResponseDTO → AuthUser
 */
export function toAuthUser(dto: AuthResponseDTO): AuthUser {
  const roles = dto.roles.map(normalizeRole);
  const firstName = dto.firstName ?? '';
  const lastName = dto.lastName ?? '';

  return {
    id: dto.userId,
    email: dto.email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    roles,
    userRole: roles[0] ?? 'user',
  };
}
