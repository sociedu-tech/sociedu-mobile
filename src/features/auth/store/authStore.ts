import { create } from 'zustand';

import { AuthUser } from '../adapters/authAdapter';
import { authService } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  userRole: string;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (userData?: AuthUser) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  userRole: 'guest',
  loading: true,

  hydrate: async () => {
    try {
      const user = await authService.getCachedUser();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          userRole: user.userRole || 'guest',
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  login: (userData) => {
    if (userData) {
      set({
        user: userData,
        isAuthenticated: true,
        userRole: userData.userRole || 'guest',
      });
      return;
    }

    authService.getCachedUser().then((user) => {
      if (user) {
        set({
          user,
          isAuthenticated: true,
          userRole: user.userRole || 'guest',
        });
      } else {
        set({ isAuthenticated: true, userRole: 'guest' });
      }
    });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, userRole: 'guest' });
  },
}));
