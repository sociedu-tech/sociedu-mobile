import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../../src/theme/theme';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/core/store/authStore';

/**
 * Tabs Layout
 * ─────────────────────────────────────────────
 * Web equivalent mapping:
 *   "/"        → index    (Home)
 *   "/mentors" → mentor   (MentorMarketplace)
 *   "/messages"→ messages (Tin nhắn)
 *   "/bookings"→ bookings (Lịch hẹn)
 *   n/a        → profile  (Hồ sơ cá nhân – mobile only)
 *
 * Các tab cũ (marketplace) bị ẩn bằng href: null
 * để tránh crash nếu file vẫn tồn tại trong thư mục.
 */
export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);
  const activeMode = useAuthStore((s) => s.activeMode);

  // ── Quy tắc hiển thị tab theo role ─────────────────────────
  // - Mentor: không cần tìm Mentor khác → ẩn tab "Chuyên gia"
  // - Guest : chưa đăng nhập → ẩn "Tin nhắn" và "Lịch hẹn"
  const isGuest = !isAuthenticated;
  const isMentor = roles.includes('mentor');
  const hideMentorDiscoveryTab = isMentor && activeMode === 'mentor';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute', // Bắt buộc cho Glassmorphism
          bottom: 0,
          borderTopWidth: 0, // Xoá viền cực cứng
          elevation: 0,      // Bỏ shadow mặc định của Android
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mentor"
        options={{
          title: 'Chuyên gia',
          href: hideMentorDiscoveryTab ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Tin nhắn',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Lịch hẹn',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

