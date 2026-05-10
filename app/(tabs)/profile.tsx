import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';
import { userService } from '../../src/core/services/userService';
import { User } from '../../src/core/types';
import { Avatar } from '../../src/components/ui/Avatar';
import { Section } from '../../src/components/ui/Section';
import { Card } from '../../src/components/ui/Card';
import { ListItem } from '../../src/components/ui/ListItem';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.loading);
  const roles = useAuthStore((s) => s.roles);
  const activeMode = useAuthStore((s) => s.activeMode);
  const setActiveMode = useAuthStore((s) => s.setActiveMode);
  const logout = useAuthStore((s) => s.logout);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await userService.getMe();
      setFullUser(data);
    } catch (e) {
      console.log('Failed to fetch full profile', e);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !authUser) return;
    fetchProfile();
  }, [authLoading, isAuthenticated, authUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn thoát phiên đăng nhập?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const displayName = fullUser?.name || authUser?.fullName || 'Người Dùng';
  const displayEmail = fullUser?.email || authUser?.email || '';
  const avatarUri = fullUser?.avatar || null;
  const canUseMentorMode = roles.includes('mentor');
  const canUseAdmin = roles.includes('admin');
  const showDashboardSection = canUseAdmin || (canUseMentorMode && activeMode === 'mentor');

  const getInitials = () => {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER BACKGROUND GRADIENT */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.topNav}>
              <Typography variant="h3" style={{ color: '#FFF', fontWeight: '800' }}>Hồ sơ</Typography>
              <TouchableOpacity onPress={() => router.push('/profile/edit')} style={styles.settingsBtn}>
                <Ionicons name="settings-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* PROFILE CARD */}
        <View style={styles.profileCardWrapper}>
          <Card variant="premium" style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarBorder}>
                <Avatar uri={avatarUri || undefined} initials={getInitials()} size={100} />
                <TouchableOpacity style={styles.editAvatarBtn} onPress={() => router.push('/profile/edit')}>
                  <Ionicons name="camera" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoSection}>
                <Typography variant="h2" style={styles.displayName}>{displayName}</Typography>
                <Typography variant="body" color="muted" style={styles.emailText}>{displayEmail}</Typography>
                
                <View style={[styles.roleBadge, { backgroundColor: activeMode === 'mentor' ? theme.colors.primarySoft : '#F1F5F9' }]}>
                  <Ionicons 
                    name={activeMode === 'mentor' ? 'ribbon' : 'person'} 
                    size={14} 
                    color={activeMode === 'mentor' ? theme.colors.primary : theme.colors.secondary} 
                  />
                  <Typography variant="caption" style={{ 
                    fontWeight: '800', 
                    color: activeMode === 'mentor' ? theme.colors.primary : theme.colors.secondary,
                    textTransform: 'uppercase'
                  }}>
                    {activeMode === 'mentor' ? 'Chế độ Mentor' : 'Chế độ Buyer'}
                  </Typography>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.switchModeBtn} 
              onPress={() => setActiveMode(activeMode === 'mentor' ? 'buyer' : 'mentor')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F8FAFC', '#F1F5F9']}
                style={styles.switchModeGradient}
              >
                <Ionicons name="swap-horizontal" size={20} color={theme.colors.primary} />
                <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.text.primary }}>
                  {activeMode === 'mentor' ? 'Chuyển sang chế độ Buyer' : 'Chuyển sang chế độ Mentor'}
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </View>

        {/* DASHBOARD SECTION */}
        {showDashboardSection && (
          <Section>
            <Typography variant="label" style={styles.sectionLabel}>Bảng điều khiển</Typography>
            <Card style={styles.listCard}>
              {canUseMentorMode && activeMode === 'mentor' && (
                <ListItem
                  title="Mentor Dashboard"
                  subtitle="Quản lý lịch hẹn & thu nhập"
                  iconName="stats-chart"
                  onPress={() => router.push('/mentor/dashboard' as any)}
                />
              )}
              {canUseAdmin && (
                <ListItem
                  title="Hệ thống Quản trị"
                  subtitle="Kiểm duyệt & Cấu hình"
                  iconName="shield-checkmark"
                  onPress={() => router.push('/admin/index' as any)}
                />
              )}
            </Card>
          </Section>
        )}

        {/* ACCOUNT SECTION */}
        <Section>
          <Typography variant="label" style={styles.sectionLabel}>Tài khoản</Typography>
          <Card style={styles.listCard}>
            <ListItem
              title="Thông tin cá nhân"
              subtitle="Cập nhật hồ sơ & ảnh đại diện"
              iconName="person-circle"
              onPress={() => router.push('/profile/edit')}
            />
            <ListItem
              title="Chứng chỉ & Kinh nghiệm"
              subtitle="Xác minh năng lực chuyên môn"
              iconName="medal"
              onPress={() => {}}
            />
            <ListItem
              title="Cài đặt thông báo"
              iconName="notifications"
              onPress={() => {}}
            />
            <ListItem
              title="Báo cáo tiến độ"
              subtitle="Theo dõi lộ trình học tập"
              iconName="document-text"
              onPress={() => router.push('/profile/progress-reports')}
            />
          </Card>
        </Section>

        {/* SUPPORT SECTION */}
        <Section>
          <Typography variant="label" style={styles.sectionLabel}>Hỗ trợ</Typography>
          <Card style={styles.listCard}>
            <ListItem
              title="Trung tâm trợ giúp"
              iconName="help-circle"
              onPress={() => {}}
            />
            <ListItem
              title="Điều khoản & Chính sách"
              iconName="document-lock"
              onPress={() => {}}
            />
          </Card>
        </Section>

        {/* LOGOUT BUTTON */}
        <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl }}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={20} color={theme.colors.error} />
            <Typography variant="bodyMedium" style={{ fontWeight: '800', color: theme.colors.error }}>
              Đăng xuất
            </Typography>
          </TouchableOpacity>
          <Typography variant="caption" color="muted" align="center" style={{ marginTop: 20, opacity: 0.6 }}>
            UniShare v1.2.0 • Made with ❤️
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    height: 180,
    paddingHorizontal: theme.spacing.lg,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  settingsBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileCardWrapper: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -60,
  },
  profileCard: {
    borderRadius: 28,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 56,
    backgroundColor: '#FFF',
    ...theme.shadows.medium,
    position: 'relative',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 2, right: 2,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF',
  },
  infoSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  displayName: {
    fontWeight: '900',
    color: theme.colors.text.primary,
  },
  emailText: {
    marginTop: 2,
    fontSize: 14,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: 20,
  },
  switchModeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  switchModeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    color: theme.colors.text.muted,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  listCard: {
    paddingVertical: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...theme.shadows.soft,
  }
});
