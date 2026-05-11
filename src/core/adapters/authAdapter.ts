/**
 * authAdapter.ts
 * Chuyen doi auth/session DTO sang AuthUser cho mobile store.
 */
import { AuthResponseDTO, SessionMeResponseDTO } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline?: string;
  emailVerified?: boolean;
  roles: string[];
  userRole: string;
}

function normalizeRole(role: string): string {
  return role.replace(/^ROLE_/, '').toLowerCase();
}

function normalizeRoles(roles: string[]): string[] {
  return roles.map(normalizeRole);
}

export function toAuthUser(dto: AuthResponseDTO, session?: SessionMeResponseDTO | null): AuthUser {
  const roles = normalizeRoles(session?.roles ?? dto.roles);
  const firstName = session?.firstName ?? dto.firstName ?? '';
  const lastName = session?.lastName ?? dto.lastName ?? '';

  return {
    id: session?.userId ?? dto.userId,
    email: session?.email ?? dto.email,
    firstName,
    lastName,
    fullName: session?.fullName || `${firstName} ${lastName}`.trim(),
    headline: session?.headline ?? undefined,
    emailVerified: session?.emailVerified,
    roles,
    userRole: roles[0] ?? 'user',
  };
}

export function toAuthUserFromSession(session: SessionMeResponseDTO): AuthUser {
  const roles = normalizeRoles(session.roles);
  const firstName = session.firstName ?? '';
  const lastName = session.lastName ?? '';

  return {
    id: session.userId,
    email: session.email,
    firstName,
    lastName,
    fullName: session.fullName || `${firstName} ${lastName}`.trim(),
    headline: session.headline ?? undefined,
    emailVerified: session.emailVerified,
    roles,
    userRole: roles[0] ?? 'user',
  };
}
