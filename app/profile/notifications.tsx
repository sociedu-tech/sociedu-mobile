import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { TEXT } from '../../src/core/constants/strings';

export default function NotificationSettingsScreen() {
  const router = useRouter();

  // Local state for toggles (should be synced with backend/persistence later)
  const [settings, setSettings] = useState({
    messages: true,
    bookings: true,
    reports: true,
    system: true,
    promotions: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Typography variant="h3" style={{ color: '#FFF', fontWeight: '800' }}>
              {TEXT.NOTIFICATION_SETTINGS.HEADER_TITLE}
            </Typography>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HOẠT ĐỘNG */}
        <View style={styles.section}>
          <Typography variant="label" style={styles.sectionLabel}>
            {TEXT.NOTIFICATION_SETTINGS.SECTION_ACTIVITY}
          </Typography>
          <Card style={styles.settingsCard}>
            <SettingItem
              icon="chatbubbles"
              label={TEXT.NOTIFICATION_SETTINGS.LABEL_MESSAGES}
              description={TEXT.NOTIFICATION_SETTINGS.DESC_MESSAGES}
              value={settings.messages}
              onToggle={() => toggleSetting('messages')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="calendar"
              label={TEXT.NOTIFICATION_SETTINGS.LABEL_BOOKINGS}
              description={TEXT.NOTIFICATION_SETTINGS.DESC_BOOKINGS}
              value={settings.bookings}
              onToggle={() => toggleSetting('bookings')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text"
              label={TEXT.NOTIFICATION_SETTINGS.LABEL_REPORTS}
              description={TEXT.NOTIFICATION_SETTINGS.DESC_REPORTS}
              value={settings.reports}
              onToggle={() => toggleSetting('reports')}
            />
          </Card>
        </View>

        {/* HỆ THỐNG */}
        <View style={styles.section}>
          <Typography variant="label" style={styles.sectionLabel}>
            {TEXT.NOTIFICATION_SETTINGS.SECTION_SYSTEM}
          </Typography>
          <Card style={styles.settingsCard}>
            <SettingItem
              icon="shield-checkmark"
              label={TEXT.NOTIFICATION_SETTINGS.LABEL_SYSTEM}
              description={TEXT.NOTIFICATION_SETTINGS.DESC_SYSTEM}
              value={settings.system}
              onToggle={() => toggleSetting('system')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="megaphone"
              label={TEXT.NOTIFICATION_SETTINGS.LABEL_PROMOTIONS}
              description={TEXT.NOTIFICATION_SETTINGS.DESC_PROMOTIONS}
              value={settings.promotions}
              onToggle={() => toggleSetting('promotions')}
            />
          </Card>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.text.muted} />
          <Typography variant="caption" color="muted" style={styles.infoText}>
            Bạn có thể quản lý chi tiết hơn các quyền thông báo trong phần Cài đặt của hệ điều hành.
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingItem({ icon, label, description, value, onToggle }: any) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>{label}</Typography>
        <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>{description}</Typography>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E2E8F0', true: theme.colors.primary }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#FFF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { height: 120, paddingHorizontal: 20 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionLabel: { textTransform: 'uppercase', color: theme.colors.text.muted, fontSize: 12, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  settingsCard: { borderRadius: 24, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 16, marginRight: 8 },
  divider: { height: 1, backgroundColor: theme.colors.border.light, marginLeft: 72 },
  infoBox: { flexDirection: 'row', padding: 20, alignItems: 'center', marginTop: 10 },
  infoText: { flex: 1, marginLeft: 10, lineHeight: 18 },
});
