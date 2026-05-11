import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthUser } from '../adapters/authAdapter';
import { STORAGE_KEYS } from '../api';
import { authService } from '../services/authService';

export type ActiveMode = 'buyer' | 'mentor';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  roles: string[];
  userRole: string;
  activeMode: ActiveMode;
  loading: boolean;

  hydrate: () => Promise<void>;
  login: (userData?: AuthUser) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  setActiveMode: (mode: ActiveMode) => void;
  logout: () => Promise<void>;
}

function coerceActiveMode(value: string | null): ActiveMode | null {
  if (value === 'buyer' || value === 'mentor') return value;
  return null;
}

function getFallbackMode(roles: string[]): ActiveMode {
  return roles.includes('mentor') ? 'mentor' : 'buyer';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  roles: [],
  userRole: 'guest',
  activeMode: 'buyer',
  loading: true,

  hydrate: async () => {
    try {
      const user = await authService.getCachedUser();
      if (!user) {
        set({
          user: null,
          isAuthenticated: false,
          roles: [],
          userRole: 'guest',
          activeMode: 'buyer',
          loading: false,
        });
        return;
      }

      const roles = user.roles ?? [];
      const storedMode = coerceActiveMode(await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_MODE));
      const activeMode = storedMode ?? getFallbackMode(roles);

      set({
        user,
        isAuthenticated: true,
        roles,
        userRole: user.userRole || roles[0] || 'user',
        activeMode,
        loading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        roles: [],
        userRole: 'guest',
        activeMode: 'buyer',
        loading: false,
      });
    }
  },

  login: (userData) => {
    if (userData) {
      const roles = userData.roles ?? [];
      const fallbackMode = getFallbackMode(roles);
      const userRole = userData.userRole || roles[0] || 'user';

      // Set ngay Ä‘á»ƒ UI redirect nhanh; sau Ä‘Ã³ Ä‘á»c persist mode (náº¿u cÃ³).
      set({
        user: userData,
        isAuthenticated: true,
        roles,
        userRole,
        activeMode: fallbackMode,
      });

      AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_MODE)
        .then((raw) => coerceActiveMode(raw))
        .then((storedMode) => {
          const mode = storedMode ?? fallbackMode;
          if (mode !== fallbackMode) {
            set({ activeMode: mode });
          }
          void AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
        })
        .catch(() => {
          void AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, fallbackMode);
        });

      return;
    }

    authService
      .getCachedUser()
      .then(async (user) => {
        if (!user) {
          set({ user: null, isAuthenticated: false, roles: [], userRole: 'guest', activeMode: 'buyer' });
          return;
        }

        const roles = user.roles ?? [];
        const storedMode = coerceActiveMode(await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_MODE));
        const activeMode = storedMode ?? getFallbackMode(roles);

        set({
          user,
          isAuthenticated: true,
          roles,
          userRole: user.userRole || roles[0] || 'user',
          activeMode,
        });
      })
      .catch(() => {
        set({ user: null, isAuthenticated: false, roles: [], userRole: 'guest', activeMode: 'buyer' });
      });
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, ...partial } };
    });
  },

  setActiveMode: (mode) => {
    set({ activeMode: mode });
    void AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, roles: [], userRole: 'guest', activeMode: 'buyer' });
  },
}));
