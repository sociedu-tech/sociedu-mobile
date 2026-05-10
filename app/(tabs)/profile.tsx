import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Typography } from '../../src/components/typography/Typography';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';
import { userService } from '../../src/core/services/userService';
import { User } from '../../src/core/types';
import { Avatar } from '../../src/components/ui/Avatar';
import { Section } from '../../src/components/ui/Section';
import { Card } from '../../src/components/ui/Card';
import { ListItem } from '../../src/components/ui/ListItem';


function RoleBadge({ role }: { role: string }) {
  return (
    <View style={{ backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border.default, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
      <Typography variant="caption" style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 10, letterSpacing: 0.5, textAlign: 'center' }}>
        {role.toUpperCase()}
      </Typography>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.loading);
  const roles = useAuthStore((s) => s.roles);
  const activeRole = useAuthStore((s) => s.activeRole);
  const switchRole = useAuthStore((s) => s.switchRole);
  const logout = useAuthStore((s) => s.logout);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await userService.getMe();
      setFullUser(data);
    } catch {
      setFullUser(null);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !authUser) {
      return;
    }

    fetchProfile();
  }, [authLoading, isAuthenticated, authUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng thoát phiên đăng nhập?', [
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


  const getInitials = () => {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ backgroundColor: theme.colors.surface, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.border.default, alignItems: 'center' }}>
         <Typography variant="h3" style={{ fontWeight: '800' }}>Hồ sơ cá nhân</Typography>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
           <Avatar uri={avatarUri || undefined} initials={getInitials()} size={96} />
           <View style={{ marginTop: -14, zIndex: 10, flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
             {roles.map((role) => <RoleBadge key={role} role={role} />)}
           </View>
           <Typography variant="h2" style={{ fontWeight: '800', color: theme.colors.text.primary, marginTop: 12, marginBottom: 4, textAlign: 'center' }}>{displayName}</Typography>
           <Typography variant="body" color="secondary" style={{ textAlign: 'center', marginBottom: 20 }}>{displayEmail}</Typography>
           
           <TouchableOpacity style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => router.push('/profile/edit')} activeOpacity={0.7}>
             <Ionicons name="pencil" size={14} color={theme.colors.primary} />
             <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.primary, fontSize: 14 }}>Chỉnh sửa hồ sơ</Typography>
           </TouchableOpacity>
        </View>

        {/* BẢNG ĐIỀU KHIỂN */}
        {roles.length > 1 && (
          <Section style={{ marginBottom: theme.spacing.xl }}>
            <Typography variant="label" style={{ fontWeight: '700', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm, marginLeft: theme.spacing.xs, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 }}>Vai trÃ² hiá»‡n táº¡i</Typography>
            <Card style={{ padding: theme.spacing.sm, borderRadius: theme.borderRadius.xl }}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                {roles.map((role) => {
                  const selected = role === activeRole;
                  return (
                    <TouchableOpacity
                      key={role}
                      onPress={() => switchRole(role)}
                      style={{ flex: 1, minWidth: 120, paddingVertical: 12, paddingHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.lg, backgroundColor: selected ? theme.colors.primary : theme.colors.surface, borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border.default, alignItems: 'center' }}
                      activeOpacity={0.75}
                    >
                      <Typography variant="bodyMedium" style={{ color: selected ? theme.colors.text.inverse : theme.colors.text.primary, fontWeight: '700' }}>
                        {role.toUpperCase()}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </Section>
        )}

        {(roles.includes('mentor') || roles.includes('admin')) && (
          <Section style={{ marginBottom: theme.spacing.xl }}>
            <Typography variant="label" style={{ fontWeight: '700', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm, marginLeft: theme.spacing.xs, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 }}>Bảng điều khiển</Typography>
            <Card style={{ paddingVertical: 0, borderRadius: theme.borderRadius.xl, overflow: 'hidden' }}>
              {roles.includes('mentor') && (
                <ListItem
                  title="Mentor Dashboard"
                  subtitle="Quản lý lịch hẹn, gói dịch vụ"
                  iconName="briefcase-outline"
                  onPress={() => router.push('/mentor/dashboard' as any)}
                />
              )}
              {roles.includes('admin') && (
                <ListItem
                  title="Admin Panel"
                  subtitle="Kiểm duyệt user & hệ thống"
                  iconName="shield-checkmark-outline"
                  onPress={() => router.push('/admin/index' as any)}
                />
              )}
            </Card>
          </Section>
        )}

        {/* CHUNG */}
        <Section style={{ marginBottom: theme.spacing.xl }}>
          <Typography variant="label" style={{ fontWeight: '700', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm, marginLeft: theme.spacing.xs, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 }}>Chung</Typography>
          <Card style={{ paddingVertical: 0, borderRadius: theme.borderRadius.xl, overflow: 'hidden' }}>
            <ListItem
              title="Chứng chỉ & Kinh nghiệm"
              subtitle="Cập nhật lịch sử làm việc"
              iconName="document-text-outline"
              onPress={() => {}}
            />
            <ListItem
              title="Cài đặt tài khoản"
              iconName="settings-outline"
              onPress={() => {}}
            />
            <ListItem
              title="Trung tâm trợ giúp"
              iconName="help-circle-outline"
              onPress={() => {}}
            />
          </Card>
        </Section>

        {/* ACTIONS: ĐĂNG XUẤT */}
        <Section style={{ marginTop: theme.spacing.sm }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: '#FECACA' }} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.error }}>Đăng xuất</Typography>
          </TouchableOpacity>
        </Section>

        <Typography variant="caption" color="secondary" align="center" style={{ opacity: 0.5, marginTop: theme.spacing.xl }}>
          Phiên bản 1.0.0
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}


