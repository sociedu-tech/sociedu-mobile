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
import { LinearGradient } from 'expo-linear-gradient';

import { CustomButton } from '../../src/components/button/CustomButton';
import { TextInput } from '../../src/components/form/TextInput';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { User, VerificationStatus } from '../../src/core/types';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { LoadingState } from '../../src/components/states/LoadingState';

type FormErrors = {
  headline?: string;
  expertise?: string;
  basePrice?: string;
};

const STATUS_META: Record<
  VerificationStatus,
  { title: string; message: string; tone: string; backgroundColor: string; icon: any }
> = {
  pending: {
    title: TEXT.MENTOR_PROFILE.STATUS_PENDING,
    message: TEXT.MENTOR_PROFILE.STATUS_PENDING_DESC,
    tone: theme.colors.warning,
    backgroundColor: '#FFFBEB',
    icon: 'time',
  },
  verified: {
    title: TEXT.MENTOR_PROFILE.STATUS_VERIFIED,
    message: TEXT.MENTOR_PROFILE.STATUS_VERIFIED_DESC,
    tone: theme.colors.success,
    backgroundColor: '#ECFDF5',
    icon: 'checkmark-circle',
  },
  rejected: {
    title: TEXT.MENTOR_PROFILE.STATUS_REJECTED,
    message: TEXT.MENTOR_PROFILE.STATUS_REJECTED_DESC,
    tone: theme.colors.error,
    backgroundColor: '#FEF2F2',
    icon: 'close-circle',
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
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [errors, setErrors] = useState<FormErrors>({});

  const hydrateForm = (user: User) => {
    setMentorProfile(user);
    setHeadline(user.mentorInfo?.headline ?? user.headline ?? '');
    setExpertiseText(user.mentorInfo?.expertise?.join(', ') ?? '');
    setBasePriceText(user.mentorInfo?.price && user.mentorInfo.price > 0 ? String(user.mentorInfo.price) : '');
    setVerificationStatus(user.mentorInfo?.verificationStatus ?? 'pending');
  };

  const validate = useCallback((): FormErrors => {
    const nextErrors: FormErrors = {};
    const parsedPrice = Number(basePriceText.trim());
    if (!headline.trim()) nextErrors.headline = TEXT.MENTOR_PROFILE.VALIDATION_HEADLINE_REQUIRED;
    if (!expertiseText.trim()) nextErrors.expertise = TEXT.MENTOR_PROFILE.VALIDATION_EXPERTISE_REQUIRED;
    if (!basePriceText.trim()) nextErrors.basePrice = TEXT.MENTOR_PROFILE.VALIDATION_BASE_PRICE_REQUIRED;
    else if (Number.isNaN(parsedPrice) || parsedPrice <= 0) nextErrors.basePrice = TEXT.MENTOR_PROFILE.VALIDATION_BASE_PRICE_INVALID;
    return nextErrors;
  }, [basePriceText, expertiseText, headline]);

  const isFormValid = useMemo(() => Object.keys(validate()).length === 0, [validate]);

  const loadMentorProfile = useCallback(async () => {
    setFetching(true);
    try {
      const user = await mentorService.getMyProfile();
      hydrateForm(user);
    } catch (error: any) {
      Alert.alert(TEXT.MENTOR_PROFILE.ALERT_TITLE_ERROR, error?.message || TEXT.MENTOR_PROFILE.ALERT_LOAD_ERROR);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { void loadMentorProfile(); }, [loadMentorProfile]);

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    try {
      const updated = await mentorService.updateMyProfile({
        headline: headline.trim(),
        expertise: expertiseText.split(',').map(v => v.trim()).filter(Boolean).join(','),
        basePrice: Number(basePriceText.trim()),
      });
      hydrateForm(updated);
      Alert.alert(TEXT.MENTOR_PROFILE.ALERT_TITLE_SUCCESS, TEXT.MENTOR_PROFILE.ALERT_SAVE_SUCCESS);
    } catch (error: any) {
      Alert.alert(TEXT.MENTOR_PROFILE.ALERT_TITLE_ERROR, error?.message || TEXT.MENTOR_PROFILE.ALERT_SAVE_ERROR);
    } finally { setSaving(false); }
  };

  const handleSubmitForReview = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    try {
      const updated = await mentorService.submitMyProfile();
      hydrateForm(updated);
      Alert.alert(TEXT.MENTOR_PROFILE.ALERT_TITLE_SUBMITTED, TEXT.MENTOR_PROFILE.ALERT_SUBMIT_SUCCESS);
    } catch (error: any) {
      Alert.alert(TEXT.MENTOR_PROFILE.ALERT_TITLE_ERROR, error?.message || TEXT.MENTOR_PROFILE.ALERT_SUBMIT_ERROR);
    } finally { setSubmitting(false); }
  };

  if (fetching) return <LoadingState message={TEXT.MENTOR_PROFILE.LOADING} />;

  const statusMeta = STATUS_META[verificationStatus];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.topGradient}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <Typography variant="bodyMedium" style={{ color: '#FFF', fontWeight: '700' }}>{TEXT.MENTOR_PROFILE.TITLE}</Typography>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* STATUS CARD */}
          <View style={styles.cardWrapper}>
            <Card variant="premium" style={[styles.statusCard, { borderTopColor: statusMeta.tone, borderTopWidth: 4 }]}>
              <View style={[styles.statusIconBox, { backgroundColor: statusMeta.backgroundColor }]}>
                <Ionicons name={statusMeta.icon} size={24} color={statusMeta.tone} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="label" style={{ color: statusMeta.tone, textTransform: 'uppercase' }}>{statusMeta.title}</Typography>
                <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>{statusMeta.message}</Typography>
              </View>
            </Card>
          </View>

          {/* FORM SECTION */}
          <View style={styles.section}>
            <Typography variant="label" style={styles.sectionLabel}>Thông tin Chuyên môn</Typography>
            <Card style={styles.formCard}>
              <TextInput
                label={TEXT.MENTOR_PROFILE.HEADLINE_LABEL}
                placeholder={TEXT.MENTOR_PROFILE.HEADLINE_PLACEHOLDER}
                leftIcon="bookmark"
                value={headline}
                onChangeText={v => { setHeadline(v); setErrors(p => ({ ...p, headline: undefined })); }}
                error={errors.headline}
              />
              <TextInput
                label={TEXT.MENTOR_PROFILE.EXPERTISE_LABEL}
                placeholder={TEXT.MENTOR_PROFILE.EXPERTISE_PLACEHOLDER}
                leftIcon="star"
                value={expertiseText}
                onChangeText={v => { setExpertiseText(v); setErrors(p => ({ ...p, expertise: undefined })); }}
                error={errors.expertise}
                isTextArea
              />
              <TextInput
                label={TEXT.MENTOR_PROFILE.BASE_PRICE_LABEL}
                placeholder={TEXT.MENTOR_PROFILE.BASE_PRICE_PLACEHOLDER}
                leftIcon="cash"
                keyboardType="numeric"
                value={basePriceText}
                onChangeText={v => { setBasePriceText(v.replace(/[^0-9]/g, '')); setErrors(p => ({ ...p, basePrice: undefined })); }}
                error={errors.basePrice}
              />
            </Card>
          </View>

          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={20} color={theme.colors.info} />
            <Typography variant="caption" color="muted" style={{ flex: 1, marginLeft: 10, lineHeight: 18 }}>
              {TEXT.MENTOR_PROFILE.VERIFYING_NOTE}
            </Typography>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            label={TEXT.MENTOR_PROFILE.BUTTON_SAVE}
            variant="gradient"
            size="lg"
            onPress={handleSave}
            loading={saving}
            disabled={saving || submitting}
            style={{ flex: 1 }}
          />
          <CustomButton
            label="Gửi duyệt"
            variant="outline"
            size="lg"
            onPress={handleSubmitForReview}
            loading={submitting}
            disabled={saving || submitting || !isFormValid || verificationStatus === 'verified'}
            style={{ flex: 1 }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
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
  topGradient: { height: 140, paddingHorizontal: 20 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  cardWrapper: { paddingHorizontal: 20, marginTop: -40 },
  statusCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, gap: 16 },
  statusIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionLabel: { textTransform: 'uppercase', color: theme.colors.text.muted, fontSize: 12, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  formCard: { padding: 20, borderRadius: 28, gap: 16 },
  noteBox: { flexDirection: 'row', padding: 16, backgroundColor: '#EFF6FF', marginHorizontal: 20, borderRadius: 16, marginTop: 20 },
  footer: { flexDirection: 'row', padding: 20, gap: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: theme.colors.border.light },
});
