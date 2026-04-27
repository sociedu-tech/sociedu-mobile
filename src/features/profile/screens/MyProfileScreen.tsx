import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/src/components/typography/Typography';
import { Avatar } from '@/src/components/ui/Avatar';
import { Card } from '@/src/components/ui/Card';
import { ListItem } from '@/src/components/ui/ListItem';
import { Section } from '@/src/components/ui/Section';
import { TEXT } from '@/src/core/constants/strings';
import { User } from '@/src/core/types';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { theme } from '@/src/theme/theme';

import { userService } from '../services/userService';

export default function MyProfileScreen() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const roles = useAuthStore((state) => state.roles);
  const effectiveRoles = useAuthStore((state) => state.effectiveRoles);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);
  const logout = useAuthStore((state) => state.logout);

  const [fullUser, setFullUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await userService.getMe();
      setFullUser(data);
    } catch {
      setFullUser(null);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(TEXT.PROFILE.LOGOUT_TITLE, TEXT.PROFILE.LOGOUT_CONFIRM, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: TEXT.PROFILE.LOGOUT_CTA,
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const displayName = fullUser?.name || authUser?.fullName || TEXT.PROFILE.USER_LABEL;
  const displayEmail = fullUser?.email || authUser?.email || '';
  const avatarUri = fullUser?.avatar || null;
  const roleLabels: Record<string, string> = {
    user: TEXT.PROFILE.USER_LABEL,
    mentor: 'Mentor',
    admin: 'Admin',
    guest: TEXT.PROFILE.GUEST_LABEL,
  };
  const activeRoleLabel = roleLabels[activeRole] || TEXT.PROFILE.USER_LABEL;
  const hasMentorRole = roles.includes('mentor');
  const hasApprovedMentorRole = effectiveRoles.includes('mentor');
  const hasAdminRole = effectiveRoles.includes('admin');
  const mentorApprovalStatus = (authUser?.mentorVerificationStatus || 'pending').toUpperCase();

  const getInitials = () => {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          paddingVertical: 18,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" style={{ fontWeight: '800' }}>
          {TEXT.PROFILE.TITLE}
        </Typography>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xxl,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
          <Avatar uri={avatarUri || undefined} initials={getInitials()} size={96} />
          <View style={{ marginTop: -14, zIndex: 10 }}>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border.default,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Typography
                variant="caption"
                style={{
                  color: theme.colors.primary,
                  fontWeight: '800',
                  fontSize: 10,
                  letterSpacing: 0.5,
                  textAlign: 'center',
                }}
              >
                {activeRoleLabel.toUpperCase()}
              </Typography>
            </View>
          </View>
          <Typography
            variant="h2"
            style={{
              fontWeight: '800',
              color: theme.colors.text.primary,
              marginTop: 12,
              marginBottom: 4,
              textAlign: 'center',
            }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="body"
            color="secondary"
            style={{ textAlign: 'center', marginBottom: 20 }}
          >
            {displayEmail}
          </Typography>

          {effectiveRoles.length > 1 ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {effectiveRoles.map((role) => {
                const active = activeRole === role;

                return (
                  <TouchableOpacity
                    key={role}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                      borderWidth: 1,
                      borderColor: active ? theme.colors.primary : theme.colors.border.default,
                    }}
                    onPress={() => setActiveRole(role)}
                    activeOpacity={0.8}
                  >
                    <Typography
                      variant="caption"
                      style={{
                        color: active ? theme.colors.text.inverse : theme.colors.text.secondary,
                        fontWeight: '700',
                      }}
                    >
                      {roleLabels[role]}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {hasMentorRole && !hasApprovedMentorRole ? (
            <Card
              style={{
                width: '100%',
                marginBottom: theme.spacing.lg,
                borderColor: theme.colors.warning,
                backgroundColor: '#FFFBEB',
              }}
            >
              <Typography
                variant="bodyMedium"
                style={{ fontWeight: '700', color: theme.colors.warning }}
              >
                {TEXT.PROFILE.MENTOR_PENDING_TITLE}
              </Typography>
              <Typography variant="caption" color="secondary" style={{ marginTop: 6 }}>
                {TEXT.PROFILE.MENTOR_PENDING_DESCRIPTION.replace('{status}', mentorApprovalStatus)}
              </Typography>
            </Card>
          ) : null}

          <TouchableOpacity
            style={{
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.primaryLight,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color={theme.colors.primary} />
            <Typography
              variant="bodyMedium"
              style={{ fontWeight: '700', color: theme.colors.primary, fontSize: 14 }}
            >
              {TEXT.PROFILE.EDIT_CTA}
            </Typography>
          </TouchableOpacity>
        </View>

        {hasApprovedMentorRole || hasAdminRole ? (
          <Section style={{ marginBottom: theme.spacing.xl }}>
            <Typography
              variant="label"
              style={{
                fontWeight: '700',
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.sm,
                marginLeft: theme.spacing.xs,
                textTransform: 'uppercase',
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              {TEXT.PROFILE.DASHBOARD}
            </Typography>
            <Card style={{ paddingVertical: 0, borderRadius: theme.borderRadius.xl, overflow: 'hidden' }}>
              {hasApprovedMentorRole ? (
                <>
                  <ListItem
                    title="Mentor Dashboard"
                    subtitle="Quản lý lịch hẹn, gói dịch vụ"
                    iconName="briefcase-outline"
                    onPress={() => router.push('/mentor/dashboard' as any)}
                  />
                  <ListItem
                    title="Gói dịch vụ"
                    subtitle="Tạo mới và cập nhật gói mentoring"
                    iconName="cube-outline"
                    onPress={() => router.push('/mentor/services' as any)}
                  />
                </>
              ) : null}
              {hasAdminRole ? (
                <ListItem
                  title="Admin Panel"
                  subtitle="Kiểm duyệt người dùng và hệ thống"
                  iconName="shield-checkmark-outline"
                  onPress={() => router.push('/admin/index' as any)}
                />
              ) : null}
            </Card>
          </Section>
        ) : null}

        <Section style={{ marginBottom: theme.spacing.xl }}>
          <Typography
            variant="label"
            style={{
              fontWeight: '700',
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.sm,
              marginLeft: theme.spacing.xs,
              textTransform: 'uppercase',
              fontSize: 13,
              letterSpacing: 0.5,
            }}
          >
            {TEXT.PROFILE.GENERAL}
          </Typography>
          <Card style={{ paddingVertical: 0, borderRadius: theme.borderRadius.xl, overflow: 'hidden' }}>
            <ListItem
              title={TEXT.PROFILE.CERTIFICATE_EXP}
              subtitle={TEXT.PROFILE.CERTIFICATE_EXP_SUB}
              iconName="document-text-outline"
              onPress={() => {}}
            />
            <ListItem
              title={TEXT.PROFILE.ACCOUNT_SETTINGS}
              iconName="settings-outline"
              onPress={() => {}}
            />
            <ListItem
              title={TEXT.PROFILE.HELP_CENTER}
              iconName="help-circle-outline"
              onPress={() => {}}
            />
          </Card>
        </Section>

        <Section style={{ marginTop: theme.spacing.sm }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 16,
              width: '100%',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Typography variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.error }}>
              {TEXT.PROFILE.LOGOUT_CTA}
            </Typography>
          </TouchableOpacity>
        </Section>

        <Typography
          variant="caption"
          color="secondary"
          align="center"
          style={{ opacity: 0.5, marginTop: theme.spacing.xl }}
        >
          Phiên bản 1.0.0
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}
