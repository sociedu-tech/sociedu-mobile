import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';

/**
 * Tabs Layout
 * ─────────────────────────────────────────────
 * Web equivalent mapping:
 *   "/"        → index    (Home)
 *   "/mentors" → mentor   (MentorMarketplace)
 *   n/a        → profile  (Hồ sơ cá nhân – mobile only)
 *
 * Các tab cũ (marketplace, explore) bị ẩn bằng href: null
 * để tránh crash nếu file vẫn tồn tại trong thư mục.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        headerShown: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.default,
          paddingBottom: 4,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mentor"
        options={{
          title: 'Chuyên gia',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {/* ── Ẩn các tab cũ nếu file vẫn tồn tại ── */}
      <Tabs.Screen name="marketplace" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
