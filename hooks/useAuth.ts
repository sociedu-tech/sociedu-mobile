/**
 * useAuth – hook wrapper cho Zustand authStore.
 *
 * API tương đương useAuth() của web (AuthContext):
 *   { user, isAuthenticated, userRole, loading, login, logout }
 */
import { useAuthStore } from '../src/core/store/authStore';
import { AuthUser } from '../src/core/adapters/authAdapter';

export type { AuthUser };

export function useAuth() {
  const { user, isAuthenticated, userRole, loading, login, logout } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    userRole,
    loading,
    login,
    logout,
  };
}
