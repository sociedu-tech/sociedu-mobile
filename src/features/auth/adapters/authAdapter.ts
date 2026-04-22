import { AuthResponseDTO } from '@/src/core/types';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  userRole: string;
}

function normalizeRole(role: string): string {
  return role.replace(/^ROLE_/, '').toLowerCase();
}

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
