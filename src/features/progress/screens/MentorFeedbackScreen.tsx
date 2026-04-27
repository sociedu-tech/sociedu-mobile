import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Card } from '@/src/components/ui/Card';
import { TEXT } from '@/src/core/constants/strings';
import { ProgressReport } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { progressService } from '../services/progressService';

function MentorFeedbackContent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) {
      setError('Thiếu mã báo cáo.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await progressService.getById(id);
      setReport(data);
      setFeedback(data.mentorFeedback ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.PROGRESS.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setSubmitError('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    if (!id) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await progressService.submitFeedback(id, feedback.trim());
      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.MENTOR_FEEDBACK.SUCCESS, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : TEXT.MENTOR_FEEDBACK.ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải báo cáo tiến độ..." />;
  }

  if (error || !report) {
    return <ErrorState error={error || 'Không tìm thấy báo cáo.'} onRetry={fetchReport} />;
  }

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
            {TEXT.MENTOR_FEEDBACK.TITLE}
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Report summary */}
          <Card style={styles.reportCard}>
            <Typography variant="label" style={styles.cardLabel}>
              Báo cáo của học viên
            </Typography>
            <Typography variant="bodyMedium" style={{ fontWeight: '700', marginTop: theme.spacing.xs }}>
              {report.title}
            </Typography>
            <Typography variant="caption" color="secondary" style={{ marginTop: 4 }}>
              {new Date(report.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
            <View style={styles.contentPreview}>
              <Typography variant="body" color="secondary" style={{ lineHeight: 22 }}>
                {report.content}
              </Typography>
            </View>
          </Card>

          {/* Feedback form */}
          <TextInput
            label={TEXT.MENTOR_FEEDBACK.FEEDBACK_LABEL}
            placeholder={TEXT.MENTOR_FEEDBACK.FEEDBACK_PLACEHOLDER}
            value={feedback}
            onChangeText={setFeedback}
            isTextArea
            numberOfLines={6}
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
            label={TEXT.MENTOR_FEEDBACK.SUBMIT}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function MentorFeedbackScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorFeedbackContent />
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
  reportCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  cardLabel: {
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  contentPreview: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
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
