import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { TextInput } from '@/src/components/form/TextInput';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { TEXT } from '@/src/core/constants/strings';
import { User, VerificationStatus } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { mentorService } from '../services/mentorService';

function getVerificationConfig(status: VerificationStatus) {
  switch (status) {
    case 'verified':
      return {
        label: TEXT.MENTOR_DASHBOARD.VERIFICATION_VERIFIED,
        color: theme.colors.success,
        icon: 'checkmark-circle' as const,
      };
    case 'rejected':
      return {
        label: TEXT.MENTOR_DASHBOARD.VERIFICATION_REJECTED,
        color: theme.colors.error,
        icon: 'close-circle' as const,
      };
    default:
      return {
        label: TEXT.MENTOR_DASHBOARD.VERIFICATION_PENDING,
        color: theme.colors.warning,
        icon: 'time' as const,
      };
  }
}

function MentorProfileEditorContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [headline, setHeadline] = useState('');
  const [expertise, setExpertise] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profile: User = await mentorService.getProfile('me');
      const info = profile.mentorInfo;

      setHeadline(info?.headline ?? '');
      setExpertise(info?.expertise.join(', ') ?? '');
      setBasePrice(info?.price ? String(info.price) : '');
      setVerificationStatus(info?.verificationStatus ?? 'pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.MENTOR_PROFILE.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!headline.trim()) {
      setSubmitError('Chức danh mentor không được để trống.');
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      await mentorService.updateMyProfile({
        headline: headline.trim(),
        expertise: expertise.trim(),
        basePrice: Number(basePrice) || undefined,
      });
      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.MENTOR_PROFILE.SAVE_SUCCESS, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : TEXT.MENTOR_PROFILE.SAVE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải hồ sơ mentor..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProfile} />;
  }

  const verConfig = getVerificationConfig(verificationStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="bodyMedium" style={styles.headerTitle}>
            {TEXT.MENTOR_PROFILE.TITLE}
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Verification status badge */}
          <View style={styles.verificationCard}>
            <Typography variant="label" style={styles.sectionLabel}>
              {TEXT.MENTOR_PROFILE.VERIFICATION_STATUS}
            </Typography>
            <View style={[styles.verificationBadge, { backgroundColor: `${verConfig.color}15` }]}>
              <Ionicons name={verConfig.icon} size={20} color={verConfig.color} />
              <Typography
                variant="bodyMedium"
                style={{ color: verConfig.color, fontWeight: '700', marginLeft: theme.spacing.sm }}
              >
                {verConfig.label}
              </Typography>
            </View>
          </View>

          <TextInput
            label={TEXT.MENTOR_PROFILE.HEADLINE_LABEL}
            placeholder={TEXT.MENTOR_PROFILE.HEADLINE_PLACEHOLDER}
            value={headline}
            onChangeText={setHeadline}
          />

          <TextInput
            label={TEXT.MENTOR_PROFILE.EXPERTISE_LABEL}
            placeholder={TEXT.MENTOR_PROFILE.EXPERTISE_PLACEHOLDER}
            value={expertise}
            onChangeText={setExpertise}
            isTextArea
            numberOfLines={3}
            helperText={TEXT.MENTOR_PROFILE.EXPERTISE_HINT}
          />

          <TextInput
            label={TEXT.MENTOR_PROFILE.BASE_PRICE_LABEL}
            placeholder={TEXT.MENTOR_PROFILE.BASE_PRICE_PLACEHOLDER}
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
          />

          {submitError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
              <Typography variant="label" style={styles.errorText}>
                {submitError}
              </Typography>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            label={TEXT.MENTOR_PROFILE.SAVE}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function MentorProfileEditorScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorProfileEditorContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: { padding: theme.spacing.sm, marginLeft: -theme.spacing.sm },
  headerTitle: { fontWeight: '700' },
  scroll: { padding: theme.spacing.lg, paddingBottom: 120 },
  verificationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  errorText: { color: theme.colors.error, fontWeight: '700', flex: 1 },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
});
