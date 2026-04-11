import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string | number;
  email: string;
  roles: string[];
  fullName: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  userRole: string;
  loading: boolean;

  /** Khởi tạo – đọc user từ AsyncStorage khi app mở */
  hydrate: () => Promise<void>;

  /** Cập nhật state sau khi login thành công (authService đã lưu token + user vào AsyncStorage) */
  login: (userData?: AuthUser) => void;

  /** Xoá state + AsyncStorage */
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  userRole: 'guest',
  loading: true,

  hydrate: async () => {
    try {
      const [savedUser, token] = await AsyncStorage.multiGet(['user', 'token']);
      if (savedUser[1] && token[1]) {
        const parsed: AuthUser = JSON.parse(savedUser[1]);
        set({
          user: parsed,
          isAuthenticated: true,
          userRole: parsed.roles?.[0]?.toLowerCase() || 'guest',
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
        userRole: userData.roles?.[0]?.toLowerCase() || 'guest',
      });
    } else {
      // Nếu không truyền userData, đọc lại từ AsyncStorage (backward compat)
      AsyncStorage.getItem('user').then((raw) => {
        if (raw) {
          const parsed: AuthUser = JSON.parse(raw);
          set({
            user: parsed,
            isAuthenticated: true,
            userRole: parsed.roles?.[0]?.toLowerCase() || 'guest',
          });
        } else {
          set({ isAuthenticated: true, userRole: 'guest' });
        }
      });
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    set({ user: null, isAuthenticated: false, userRole: 'guest' });
  },
}));
