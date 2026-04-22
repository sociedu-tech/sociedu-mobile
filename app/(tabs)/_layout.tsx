import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../../src/theme/theme';
import { StyleSheet, View } from 'react-native';
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
 * Các tab cũ (marketplace, explore) bị ẩn bằng href: null
 * để tránh crash nếu file vẫn tồn tại trong thư mục.
 */
export default function TabsLayout() {
  const userRole = useAuthStore((s) => s.userRole);

  // ── Quy tắc hiển thị tab theo role ─────────────────────────
  // - Mentor: không cần tìm Mentor khác → ẩn tab "Chuyên gia"
  // - Guest : chưa đăng nhập → ẩn "Tin nhắn" và "Lịch hẹn"
  const isMentor = userRole === 'mentor';
  const isGuest = userRole === 'guest';

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
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mentor"
        options={{
          title: 'Chuyên gia',
          href: isMentor ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Tin nhắn',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Lịch hẹn',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />

      {/* ── Ẩn các tab cũ nếu file vẫn tồn tại ── */}
      <Tabs.Screen name="marketplace" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    position: 'absolute',
    bottom: -6, // Cách nhẹ icon
  }
});
