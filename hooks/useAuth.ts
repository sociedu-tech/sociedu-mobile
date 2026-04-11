/**
 * useAuth – hook wrapper cho Zustand authStore.
 *
 * API tương đương useAuth() của web (AuthContext):
 *   { user, isAuthenticated, userRole, loading, login, logout }
 */
import { useAuthStore, AuthUser } from '../src/core/store/authStore';

export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    isAuthenticated: s.isAuthenticated,
    userRole: s.userRole,
    loading: s.loading,
    login: s.login,
    logout: s.logout,
  }));
}

export type { AuthUser };
