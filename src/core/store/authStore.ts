import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../adapters/authAdapter';
import { authService } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  userRole: string;
  loading: boolean;

  /** Khởi tạo – đọc user + token từ AsyncStorage khi app mở */
  hydrate: () => Promise<void>;

  /** Cập nhật state sau khi login thành công (authService đã lưu token + user vào AsyncStorage) */
  login: (userData?: AuthUser) => void;

  /** Xoá state + AsyncStorage thông qua authService*/
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
    } else {
      // Nếu không truyền userData, đọc lại từ AsyncStorage (backward compat)
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
    }
  },

  logout: async () => {
     await authService.logout();
     set({ user: null, isAuthenticated: false, userRole: 'guest' });
  },
}));
