import { create } from 'zustand';

import { setSessionExpiredHandler } from '@/src/core/api';
import { UserRole } from '@/src/core/types';

import { AuthUser } from '../adapters/authAdapter';
import { authService } from '../services/authService';

type ActiveUserRole = UserRole | 'guest';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  activeRole: ActiveUserRole;
  /** @deprecated Use activeRole for the UI-selected role context. */
  userRole: ActiveUserRole;
  roles: UserRole[];
  effectiveRoles: UserRole[];
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (userData?: AuthUser) => void;
  setActiveRole: (role: UserRole) => void;
  hasRole: (role: UserRole, options?: { enabledOnly?: boolean }) => boolean;
  expireSession: () => void;
  logout: () => Promise<void>;
}

function deriveStateFromUser(user: AuthUser | null) {
  return {
    user,
    isAuthenticated: Boolean(user),
    activeRole: user?.userRole ?? 'guest',
    userRole: user?.userRole ?? 'guest',
    roles: user?.roles ?? [],
    effectiveRoles: user?.effectiveRoles ?? [],
  } as const;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  activeRole: 'guest',
  userRole: 'guest',
  roles: [],
  effectiveRoles: [],
  loading: true,

  hydrate: async () => {
    try {
      const user = await authService.getCachedUser();
      set({
        ...deriveStateFromUser(user),
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  login: (userData) => {
    if (userData) {
      set({
        ...deriveStateFromUser(userData),
      });
      return;
    }

    authService.getCachedUser().then((user) => {
      set({
        ...deriveStateFromUser(user),
      });
    });
  },

  setActiveRole: (role) => {
    if (!get().effectiveRoles.includes(role)) {
      return;
    }

    set({ activeRole: role, userRole: role });
  },

  hasRole: (role, options) => {
    const enabledOnly = options?.enabledOnly ?? true;

    return enabledOnly ? get().effectiveRoles.includes(role) : get().roles.includes(role);
  },

  expireSession: () => {
    set({
      user: null,
      isAuthenticated: false,
      activeRole: 'guest',
      userRole: 'guest',
      roles: [],
      effectiveRoles: [],
      loading: false,
    });
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      activeRole: 'guest',
      userRole: 'guest',
      roles: [],
      effectiveRoles: [],
    });
  },
}));

setSessionExpiredHandler(() => {
  useAuthStore.getState().expireSession();
});
