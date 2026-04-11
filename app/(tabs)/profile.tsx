import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';

// ─── Component item menu ──────────────────────────────────────
const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  color = theme.colors.text.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuIconBox}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuContent}>
      <Typography variant="bodyMedium" style={{ color }}>{title}</Typography>
      {subtitle && (
        <Typography variant="caption" color="secondary" style={styles.menuSubtitle}>
          {subtitle}
        </Typography>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.disabled} />
  </TouchableOpacity>
);

export default function ProfileTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.userRole);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout(); // Clear store + AsyncStorage
          // _layout.tsx (RootLayout) sẽ tự động trigger useEffect
          // và `router.replace('/(auth)/login')` nhờ logic auth guard.
        },
      },
    ]);
  };

  // Giả lập avatar tạm nếu store user chưa có URL cụ thể
  const displayAvatar = user && 'avatar' in user && user.avatar
    ? { uri: user.avatar }
    : { uri: 'https://i.pravatar.cc/300?img=11' }; // Fallback mockup

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* ═════════ HEADER PROFILE SUMMARY ═════════ */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {/* Tạm dùng View mock hệt như Web, bản thực tế có thể dùng Image của expo-image */}
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={theme.colors.surface} />
            </View>
            <View style={styles.roleBadge}>
              <Typography variant="caption" style={styles.roleText}>
                {userRole.toUpperCase()}
              </Typography>
            </View>
          </View>

          <Typography variant="h2" style={styles.name}>
            {user?.fullName || 'Người dùng'}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.email}>
            {user?.email}
          </Typography>

          <CustomButton 
            variant="outline"
            label="Chỉnh sửa hồ sơ"
            size="md"
            onPress={() => router.push('/profile/edit' as any)}
            style={styles.editBtn}
          />
        </View>

        {/* ═════════ QUẢN TRỊ (CHỈ HIỆN THEO ROLE) ═════════ */}
        {(userRole === 'mentor' || userRole === 'admin') && (
          <View style={styles.section}>
            <Typography variant="label" color="secondary" style={styles.sectionTitle}>
              BẢNG ĐIỀU KHIỂN
            </Typography>
            <View style={styles.card}>
              {userRole === 'mentor' && (
                <MenuItem
                  icon="briefcase-outline"
                  title="Mentor Dashboard"
                  subtitle="Quản lý lịch hẹn, gói dịch vụ..."
                  onPress={() => router.push('/mentor/dashboard' as any)}
                />
              )}
              {userRole === 'admin' && (
                <MenuItem
                  icon="shield-checkmark-outline"
                  title="Admin Panel"
                  subtitle="Kiểm duyệt user, theo dõi hệ thống..."
                  onPress={() => router.push('/admin/index' as any)}
                />
              )}
            </View>
          </View>
        )}

        {/* ═════════ TIỆN ÍCH CƠ BẢN ═════════ */}
        <View style={styles.section}>
          <Typography variant="label" color="secondary" style={styles.sectionTitle}>
            CHUNG
          </Typography>
          <View style={styles.card}>
            <MenuItem
              icon="document-text-outline"
              title="Lịch sử giao dịch"
              onPress={() => {}} // Placeholder cho Giai đoạn 4
            />
            <MenuItem
              icon="settings-outline"
              title="Cài đặt tài khoản"
              onPress={() => {}}
            />
            <MenuItem
              icon="help-circle-outline"
              title="Trung tâm trợ giúp"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* ═════════ NÚT ĐĂNG XUẤT BỰ ═════════ */}
        <CustomButton 
          variant="outline"
          label="Đăng xuất"
          size="lg"
          icon={<Ionicons name="log-out-outline" size={20} color={theme.colors.error} />}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />

        <Typography variant="caption" color="secondary" align="center" style={styles.version}>
          Phiên bản 1.0.0
        </Typography>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  
  // ── Header ──
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.surface,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    alignSelf: 'center', // Fix center align
    transform: [{ translateX: 50 }, { translateX: -50 }], // Fake horizontal center strategy
  },
  roleText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  email: {
    marginTop: 4,
    marginBottom: 16,
  },
  editBtn: {
    paddingHorizontal: 24,
    minHeight: 40,
    borderRadius: 20,
    borderColor: theme.colors.border.default,
  },

  // ── Section & Card ──
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  
  // ── MenuItem ──
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
  },
  menuSubtitle: {
    marginTop: 2,
  },

  // ── Logout ──
  logoutBtn: {
    marginTop: 8,
    marginBottom: 32,
    borderColor: theme.colors.error,
    backgroundColor: '#FEF2F2', // error light
    borderWidth: 1,
  },
  version: {
    opacity: 0.5,
  },
});
