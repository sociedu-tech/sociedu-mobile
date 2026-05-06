import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../../src/components/button/CustomButton';
import { TextInput } from '../../../src/components/form/TextInput';
import { ProtectedRoute } from '../../../src/components/ProtectedRoute';
import { ErrorState } from '../../../src/components/states/ErrorState';
import { LoadingState } from '../../../src/components/states/LoadingState';
import { Typography } from '../../../src/components/typography/Typography';
import { Card } from '../../../src/components/ui/Card';
import { TEXT } from '../../../src/core/constants/strings';
import { progressReportService } from '../../../src/core/services/progressReportService';
import { ProgressReport, SubmitFeedbackRequest } from '../../../src/core/types';
import { theme } from '../../../src/theme/theme';

function getStatusMeta(status: ProgressReport['status']) {
  if (status === 'reviewed') return { color: theme.colors.success, label: TEXT.PROGRESS_REPORT.STATUS_REVIEWED };
  if (status === 'needs_revision') {
    return { color: theme.colors.warning, label: TEXT.PROGRESS_REPORT.STATUS_NEEDS_REVISION };
  }
  return { color: theme.colors.warning, label: TEXT.PROGRESS_REPORT.STATUS_SUBMITTED };
}

function MentorProgressReportDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<SubmitFeedbackRequest['status'] | null>(null);
  const [editing, setEditing] = useState(false);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await progressReportService.getReportById(id);
      setReport(data);
      setFeedback(data.mentorFeedback ?? '');
      setStatus(data.status === 'submitted' ? null : data.status);
      setEditing(!data.mentorFeedback);
    } catch (loadError: any) {
      setError(loadError?.message || TEXT.PROGRESS_REPORT.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const validationError = useMemo(() => {
    if (!feedback.trim()) return TEXT.PROGRESS_REPORT.VALIDATION_FEEDBACK_REQUIRED;
    if (!status) return TEXT.PROGRESS_REPORT.VALIDATION_STATUS_REQUIRED;
    return null;
  }, [feedback, status]);

  const handleSubmit = useCallback(async () => {
    if (!id || validationError || !status) {
      if (validationError) Alert.alert(TEXT.COMMON.ERROR, validationError);
      return;
    }

    setSubmitting(true);
    try {
      await progressReportService.submitFeedback(id, feedback.trim(), status);
      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.PROGRESS_REPORT.SUBMIT_SUCCESS);
      router.back();
    } catch (submitError: any) {
      Alert.alert(TEXT.COMMON.ERROR, submitError?.message || TEXT.PROGRESS_REPORT.SUBMIT_ERROR);
    } finally {
      setSubmitting(false);
    }
  }, [feedback, id, router, status, validationError]);

  if (loading) {
    return <LoadingState message={TEXT.COMMON.LOADING} />;
  }

  if (error || !report) {
    return <ErrorState error={error || TEXT.PROGRESS_REPORT.LOAD_ERROR} onRetry={() => loadReport()} />;
  }

  const statusMeta = getStatusMeta(report.status);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons color={theme.colors.text.primary} name="arrow-back" size={24} />
            </TouchableOpacity>
            <Typography style={styles.headerTitle} variant="bodyMedium">
              {TEXT.PROGRESS_REPORT.DETAIL_TITLE}
            </Typography>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Card style={styles.summaryCard}>
              <Typography style={styles.summaryTitle} variant="h3">
                {report.title}
              </Typography>
              <Typography color="secondary" style={styles.summaryLine} variant="body">
                {report.menteeName}
              </Typography>
              <View style={[styles.statusBadge, { backgroundColor: statusMeta.color }]}>
                <Typography color="inverse" style={styles.statusText} variant="caption">
                  {statusMeta.label}
                </Typography>
              </View>
              <Typography color="secondary" style={styles.summaryLine} variant="caption">
                {`${TEXT.PROGRESS_REPORT.CREATED_AT_LABEL}: ${report.createdAt.toLocaleDateString('vi-VN')}`}
              </Typography>
            </Card>

            <Card style={styles.sectionCard}>
              <Typography style={styles.sectionTitle} variant="bodyMedium">
                {TEXT.PROGRESS_REPORT.CONTENT_TITLE}
              </Typography>
              <Typography style={styles.reportContent} variant="body">
                {report.content}
              </Typography>
              {report.attachmentUrl ? (
                <TouchableOpacity onPress={() => Linking.openURL(report.attachmentUrl!)}>
                  <Typography style={styles.attachmentText} variant="caption">
                    {TEXT.PROGRESS_REPORT.ATTACHMENT_LABEL}
                  </Typography>
                </TouchableOpacity>
              ) : null}
            </Card>

            {report.mentorFeedback && !editing ? (
              <Card style={styles.sectionCard}>
                <Typography style={styles.sectionTitle} variant="bodyMedium">
                  {TEXT.PROGRESS_REPORT.FEEDBACK_EXISTING_TITLE}
                </Typography>
                <Typography style={styles.reportContent} variant="body">
                  {report.mentorFeedback}
                </Typography>
                <CustomButton
                  label={TEXT.PROGRESS_REPORT.EDIT_FEEDBACK}
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                  variant="outline"
                />
              </Card>
            ) : (
              <Card style={styles.sectionCard}>
                <Typography style={styles.sectionTitle} variant="bodyMedium">
                  {TEXT.PROGRESS_REPORT.FEEDBACK_TITLE}
                </Typography>
                <TextInput
                  error={feedback.trim() ? undefined : undefined}
                  isTextArea
                  onChangeText={setFeedback}
                  placeholder={TEXT.PROGRESS_REPORT.FEEDBACK_PLACEHOLDER}
                  value={feedback}
                />
                <Typography style={styles.sectionTitle} variant="label">
                  {TEXT.PROGRESS_REPORT.EVALUATION_LABEL}
                </Typography>
                <TouchableOpacity onPress={() => setStatus('reviewed')} style={styles.radioRow}>
                  <Ionicons
                    color={status === 'reviewed' ? theme.colors.primary : theme.colors.text.disabled}
                    name={status === 'reviewed' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                  />
                  <Typography style={styles.radioText} variant="body">
                    {TEXT.PROGRESS_REPORT.EVALUATION_REVIEWED}
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStatus('needs_revision')} style={styles.radioRow}>
                  <Ionicons
                    color={status === 'needs_revision' ? theme.colors.primary : theme.colors.text.disabled}
                    name={status === 'needs_revision' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                  />
                  <Typography style={styles.radioText} variant="body">
                    {TEXT.PROGRESS_REPORT.EVALUATION_NEEDS_REVISION}
                  </Typography>
                </TouchableOpacity>
              </Card>
            )}
          </ScrollView>

          {editing ? (
            <View style={styles.footer}>
              <CustomButton
                disabled={Boolean(validationError)}
                label={TEXT.PROGRESS_REPORT.SUBMIT_FEEDBACK}
                loading={submitting}
                onPress={handleSubmit}
              />
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default function MentorProgressReportDetailScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorProgressReportDetailContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  iconButton: { padding: theme.spacing.xs },
  headerTitle: { fontWeight: '700' },
  headerSpacer: { width: 32 },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  summaryCard: { borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  summaryTitle: { fontWeight: '800', marginBottom: theme.spacing.xs },
  summaryLine: { marginTop: theme.spacing.xs },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusText: { fontWeight: '700' },
  sectionCard: { borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, padding: theme.spacing.md },
  sectionTitle: { fontWeight: '700', marginBottom: theme.spacing.sm },
  reportContent: { lineHeight: 24 },
  attachmentText: { color: theme.colors.primary, fontWeight: '700', marginTop: theme.spacing.md },
  radioRow: { alignItems: 'center', flexDirection: 'row', marginTop: theme.spacing.sm },
  radioText: { marginLeft: theme.spacing.sm },
  editButton: { marginTop: theme.spacing.md },
  footer: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border.default,
    borderTopWidth: 1,
    padding: theme.spacing.md,
  },
});
