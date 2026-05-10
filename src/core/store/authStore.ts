import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../adapters/authAdapter';
import { authService } from '../services/authService';
import { UserRole } from '../types';

const ACTIVE_ROLE_KEY = 'activeRole';
const VALID_ROLES: UserRole[] = ['user', 'buyer', 'mentor', 'admin'];

function isUserRole(role: string | null): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

function normalizeRoles(roles: string[] | undefined): UserRole[] {
  const normalized = roles?.filter(isUserRole) ?? [];
  return normalized.length > 0 ? normalized : ['user'];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  roles: UserRole[];
  activeRole: UserRole;
  userRole: string;
  loading: boolean;

  /** Khởi tạo – đọc user + token từ AsyncStorage khi app mở */
  hydrate: () => Promise<void>;

  /** Cập nhật state sau khi login thành công (authService đã lưu token + user vào AsyncStorage) */
  login: (userData?: AuthUser) => void;

  /** Chuyển vai trò hiện tại nếu user sở hữu role đó */
  switchRole: (role: UserRole) => Promise<void>;

  /** Xoá state + AsyncStorage thông qua authService*/
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  roles: [],
  activeRole: 'user',
  userRole: 'guest',
  loading: true,

  hydrate: async () => {
    try {
      const user = await authService.getCachedUser();
      if (user) {
        const roles = normalizeRoles(user.roles);
        const storedRole = await AsyncStorage.getItem(ACTIVE_ROLE_KEY);
        const activeRole = isUserRole(storedRole) && roles.includes(storedRole) ? storedRole : roles[0];

        set({
          user,
          isAuthenticated: true,
          roles,
          activeRole,
          userRole: activeRole,
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
      const roles = normalizeRoles(userData.roles);
      const activeRole = roles[0];

      set({
        user: userData,
        isAuthenticated: true,
        roles,
        activeRole,
        userRole: activeRole,
      });
    } else {
      // Nếu không truyền userData, đọc lại từ AsyncStorage (backward compat)
      authService.getCachedUser().then((user) => {
        if (user) {
          const roles = normalizeRoles(user.roles);
          const activeRole = roles[0];

          set({
            user,
            isAuthenticated: true,
            roles,
            activeRole,
            userRole: activeRole,
          });
        } else {
           set({ isAuthenticated: true, roles: [], activeRole: 'user', userRole: 'guest' });
        }
      });
    }
  },

  switchRole: async (role) => {
    const { roles } = get();
    if (!roles.includes(role)) return;

    set({ activeRole: role, userRole: role });
    await AsyncStorage.setItem(ACTIVE_ROLE_KEY, role);
  },

  logout: async () => {
     await authService.logout();
     await AsyncStorage.removeItem(ACTIVE_ROLE_KEY);
     set({ user: null, isAuthenticated: false, roles: [], activeRole: 'user', userRole: 'guest' });
  },
}));
