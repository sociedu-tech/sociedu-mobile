import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../src/components/typography/Typography';
import { useAuthStore } from '../src/core/store/authStore';
import { UserRole } from '../src/core/types';
import { theme } from '../src/theme/theme';

type RoleOption = {
  role: Extract<UserRole, 'buyer' | 'mentor'>;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'buyer',
    title: 'Tôi muốn học',
    subtitle: 'Tìm mentor, đặt lịch học và theo dõi tiến độ.',
    icon: 'school-outline',
  },
  {
    role: 'mentor',
    title: 'Tôi muốn dạy',
    subtitle: 'Quản lý dịch vụ, lịch học và phản hồi học viên.',
    icon: 'briefcase-outline',
  },
];

export default function RolePickerScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const switchRole = useAuthStore((state) => state.switchRole);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    if (user.roles.length <= 1) {
      router.replace('/(tabs)');
    }
  }, [router, user]);

  const handleSelect = async (role: UserRole) => {
    await switchRole(role);
    router.replace('/(tabs)');
  };

  if (!user || user.roles.length <= 1) {
    return null;
  }

  const availableRoles = ROLE_OPTIONS.filter((option) => user.roles.includes(option.role));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography style={styles.title} variant="h2">
            Chọn vai trò
          </Typography>
          <Typography color="secondary" style={styles.subtitle} variant="body">
            Bạn muốn tiếp tục với vai trò nào?
          </Typography>
        </View>

        <View style={styles.cardList}>
          {availableRoles.map((option) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={option.role}
              onPress={() => handleSelect(option.role)}
              style={styles.roleCard}
            >
              <View style={styles.iconBox}>
                <Ionicons color={theme.colors.primary} name={option.icon} size={28} />
              </View>
              <View style={styles.cardText}>
                <Typography style={styles.cardTitle} variant="bodyMedium">
                  {option.title}
                </Typography>
                <Typography color="secondary" style={styles.cardSubtitle} variant="caption">
                  {option.subtitle}
                </Typography>
              </View>
              <Ionicons color={theme.colors.text.secondary} name="chevron-forward" size={20} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  cardList: {
    gap: theme.spacing.md,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
    height: 52,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    width: 52,
  },
  cardText: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    lineHeight: 18,
  },
});
