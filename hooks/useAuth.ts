/**
 * useAuth – hook wrapper cho Zustand authStore.
 *
 * API tương đương useAuth() của web (AuthContext):
 *   { user, isAuthenticated, userRole, loading, login, logout }
 */
import { useAuthStore } from '../src/core/store/authStore';
import { AuthUser } from '../src/core/adapters/authAdapter';
import { UserRole } from '../src/core/types';

export type { AuthUser, UserRole };

export function useAuth() {
  const { user, isAuthenticated, roles, activeRole, userRole, loading, login, switchRole, logout } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    roles,
    activeRole,
    userRole,
    loading,
    login,
    switchRole,
    logout,
  };
}
