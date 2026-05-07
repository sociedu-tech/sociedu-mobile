import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { CustomButton } from '../../src/components/button/CustomButton';
import { TextInput } from '../../src/components/form/TextInput';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { User, VerificationStatus } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

type FormErrors = {
  headline?: string;
  expertise?: string;
  basePrice?: string;
};

const STATUS_META: Record<
  VerificationStatus,
  { title: string; message: string; tone: string; backgroundColor: string }
> = {
  pending: {
    title: TEXT.MENTOR_PROFILE.STATUS_PENDING,
    message: TEXT.MENTOR_PROFILE.STATUS_PENDING_DESC,
    tone: theme.colors.warning,
    backgroundColor: '#FFF7ED',
  },
  verified: {
    title: TEXT.MENTOR_PROFILE.STATUS_VERIFIED,
    message: TEXT.MENTOR_PROFILE.STATUS_VERIFIED_DESC,
    tone: theme.colors.success,
    backgroundColor: '#ECFDF5',
  },
  rejected: {
    title: TEXT.MENTOR_PROFILE.STATUS_REJECTED,
    message: TEXT.MENTOR_PROFILE.STATUS_REJECTED_DESC,
    tone: theme.colors.error,
    backgroundColor: '#FEF2F2',
  },
};

function MentorProfileEditorContent() {
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mentorProfile, setMentorProfile] = useState<User | null>(null);
  const [headline, setHeadline] = useState('');
  const [expertiseText, setExpertiseText] = useState('');
  const [basePriceText, setBasePriceText] = useState('');
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('pending');
  const [errors, setErrors] = useState<FormErrors>({});

  const hydrateForm = (user: User) => {
    setMentorProfile(user);
    setHeadline(user.mentorInfo?.headline ?? user.headline ?? '');
    setExpertiseText(user.mentorInfo?.expertise?.join(', ') ?? '');
    setBasePriceText(
      user.mentorInfo?.price && user.mentorInfo.price > 0
        ? String(user.mentorInfo.price)
        : '',
    );
    setVerificationStatus(user.mentorInfo?.verificationStatus ?? 'pending');
  };

  const validate = useCallback((): FormErrors => {
    const nextErrors: FormErrors = {};
    const parsedPrice = Number(basePriceText.trim());

    if (!headline.trim()) {
      nextErrors.headline = TEXT.MENTOR_PROFILE.VALIDATION_HEADLINE_REQUIRED;
    }

    if (!expertiseText.trim()) {
      nextErrors.expertise = TEXT.MENTOR_PROFILE.VALIDATION_EXPERTISE_REQUIRED;
    }

    if (!basePriceText.trim()) {
      nextErrors.basePrice = TEXT.MENTOR_PROFILE.VALIDATION_BASE_PRICE_REQUIRED;
    } else if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      nextErrors.basePrice = TEXT.MENTOR_PROFILE.VALIDATION_BASE_PRICE_INVALID;
    }

    return nextErrors;
  }, [basePriceText, expertiseText, headline]);

  const isFormValid = useMemo(
    () => Object.keys(validate()).length === 0,
    [validate],
  );

  const loadMentorProfile = useCallback(async () => {
    setFetching(true);
    try {
      const user = await mentorService.getMyProfile();
      hydrateForm(user);
      setErrors({});
    } catch (error: any) {
      Alert.alert(
        TEXT.MENTOR_PROFILE.ALERT_TITLE_ERROR,
        error?.message || TEXT.MENTOR_PROFILE.ALERT_LOAD_ERROR,
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadMentorProfile();
  }, [loadMentorProfile]);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await mentorService.updateMyProfile({
        headline: headline.trim(),
        expertise: expertiseText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .join(','),
        basePrice: Number(basePriceText.trim()),
      });
      hydrateForm(updated);
      Alert.alert(
        TEXT.MENTOR_PROFILE.ALERT_TITLE_SUCCESS,
        TEXT.MENTOR_PROFILE.ALERT_SAVE_SUCCESS,
      );
    } catch (error: any) {
      Alert.alert(
        TEXT.MENTOR_PROFILE.ALERT_TITLE_ERROR,
        error?.message || TEXT.MENTOR_PROFILE.ALERT_SAVE_ERROR,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const updated = await mentorService.submitMyProfile();
      hydrateForm(updated);
      Alert.alert(
        TEXT.MENTOR_PROFILE.ALERT_TITLE_SUBMITTED,
        TEXT.MENTOR_PROFILE.ALERT_SUBMIT_SUCCESS,
      );
    } catch (error: any) {
      Alert.alert(
        TEXT.MENTOR_PROFILE.ALERT_TITLE_ERROR,
        error?.message || TEXT.MENTOR_PROFILE.ALERT_SUBMIT_ERROR,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Typography variant="bodyMedium" color="secondary">
            {TEXT.MENTOR_PROFILE.LOADING}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const statusMeta = STATUS_META[verificationStatus];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="bodyMedium" style={styles.headerTitle}>
            {TEXT.MENTOR_PROFILE.TITLE}
          </Typography>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Typography variant="h3" style={styles.heroTitle}>
              {TEXT.MENTOR_PROFILE.TITLE}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.heroDescription}>
              {TEXT.MENTOR_PROFILE.DESCRIPTION}
            </Typography>
          </View>

          <View style={[styles.statusCard, { backgroundColor: statusMeta.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.tone }]} />
            <View style={styles.statusContent}>
              <Typography variant="label" color="secondary" style={styles.statusLabel}>
                {TEXT.MENTOR_PROFILE.STATUS_CARD_LABEL}
              </Typography>
              <Typography variant="bodyMedium" style={[styles.statusTitle, { color: statusMeta.tone }]}>
                {statusMeta.title}
              </Typography>
              <Typography variant="body" color="secondary">
                {statusMeta.message}
              </Typography>
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="bodyMedium" style={styles.sectionTitle}>
              {TEXT.MENTOR_PROFILE.SECTION_TITLE}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.sectionDescription}>
              {TEXT.MENTOR_PROFILE.SECTION_DESCRIPTION}
            </Typography>

            <TextInput
              label={TEXT.MENTOR_PROFILE.HEADLINE_LABEL}
              placeholder={TEXT.MENTOR_PROFILE.HEADLINE_PLACEHOLDER}
              helperText={TEXT.MENTOR_PROFILE.HEADLINE_HELPER}
              leftIcon="briefcase-outline"
              value={headline}
              onChangeText={(value) => {
                setHeadline(value);
                clearFieldError('headline');
              }}
              error={errors.headline}
            />

            <TextInput
              label={TEXT.MENTOR_PROFILE.EXPERTISE_LABEL}
              placeholder={TEXT.MENTOR_PROFILE.EXPERTISE_PLACEHOLDER}
              helperText={TEXT.MENTOR_PROFILE.EXPERTISE_HELPER}
              leftIcon="ribbon-outline"
              value={expertiseText}
              onChangeText={(value) => {
                setExpertiseText(value);
                clearFieldError('expertise');
              }}
              error={errors.expertise}
              isTextArea
            />

            <TextInput
              label={TEXT.MENTOR_PROFILE.BASE_PRICE_LABEL}
              placeholder={TEXT.MENTOR_PROFILE.BASE_PRICE_PLACEHOLDER}
              helperText={TEXT.MENTOR_PROFILE.BASE_PRICE_HELPER}
              leftIcon="cash-outline"
              keyboardType="numeric"
              value={basePriceText}
              onChangeText={(value) => {
                setBasePriceText(value.replace(/[^0-9]/g, ''));
                clearFieldError('basePrice');
              }}
              error={errors.basePrice}
            />

            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.info} />
              <Typography variant="caption" color="secondary" style={styles.noteText}>
                {TEXT.MENTOR_PROFILE.VERIFYING_NOTE}
              </Typography>
            </View>
          </View>

          {mentorProfile?.id ? (
            <Typography variant="caption" color="secondary" style={styles.metaText}>
              ID Mentor: {mentorProfile.id}
            </Typography>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            label={TEXT.MENTOR_PROFILE.BUTTON_SAVE}
            size="lg"
            onPress={handleSave}
            loading={saving}
            disabled={saving || submitting}
            style={styles.footerButton}
          />
          <CustomButton
            label={TEXT.MENTOR_PROFILE.BUTTON_SUBMIT}
            size="lg"
            variant="outline"
            onPress={handleSubmitForReview}
            loading={submitting}
            disabled={saving || submitting || !isFormValid || verificationStatus === 'verified'}
            style={styles.footerButton}
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSpacer: {
    width: 24,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    marginBottom: theme.spacing.xs,
  },
  heroDescription: {
    lineHeight: 22,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    marginTop: 6,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    marginBottom: 4,
  },
  statusTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  noteText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    lineHeight: 18,
  },
  metaText: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});
