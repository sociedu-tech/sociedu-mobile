import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { Typography } from '@/src/components/typography/Typography';
import { TEXT } from '@/src/core/constants/strings';
import { ReportEntityType } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { reportService } from '../services/reportService';

const ENTITY_TYPES: { label: string; value: ReportEntityType }[] = [
  { label: 'Người dùng', value: 'user' },
  { label: 'Tin nhắn', value: 'message' },
  { label: 'Lịch hẹn', value: 'booking' },
  { label: 'Buổi học', value: 'session' },
];

const REASONS = [
  'Hành vi không phù hợp',
  'Nội dung vi phạm',
  'Gian lận / lừa đảo',
  'Spam / quấy rối',
  'Không thực hiện dịch vụ',
  'Khác',
];

export default function CreateReportScreen() {
  const router = useRouter();
  const { entityType, entityId } = useLocalSearchParams<{
    entityType?: string;
    entityId?: string;
  }>();

  const [selectedType, setSelectedType] = useState<ReportEntityType>(
    (entityType as ReportEntityType) || 'user'
  );
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason.trim()) {
      setError('Vui lòng chọn lý do báo cáo.');
      return;
    }

    if (!description.trim()) {
      setError('Vui lòng mô tả chi tiết vấn đề.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reportService.createReport({
        entityType: selectedType.toUpperCase(),
        entityId: entityId || '',
        reason: selectedReason,
        description: description.trim(),
      });
      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.REPORT.SUCCESS, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.REPORT.ERROR);
    } finally {
      setSubmitting(false);
    }
  };

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
            {TEXT.REPORT.TITLE}
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Typography variant="label" style={styles.label}>
            {TEXT.REPORT.ENTITY_TYPE_LABEL}
          </Typography>
          <View style={styles.chipRow}>
            {ENTITY_TYPES.map((item) => {
              const isActive = selectedType === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedType(item.value)}
                  activeOpacity={0.8}
                >
                  <Typography
                    variant="caption"
                    style={[styles.chipText, isActive && styles.chipTextActive]}
                  >
                    {item.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <Typography variant="label" style={styles.label}>
            {TEXT.REPORT.REASON_LABEL}
          </Typography>
          <View style={styles.reasonList}>
            {REASONS.map((reason) => {
              const isActive = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonItem, isActive && styles.reasonItemActive]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isActive ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isActive ? theme.colors.primary : theme.colors.text.secondary}
                  />
                  <Typography
                    variant="body"
                    style={{ marginLeft: theme.spacing.sm, flex: 1 }}
                  >
                    {reason}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            label={TEXT.REPORT.DESCRIPTION_LABEL}
            placeholder={TEXT.REPORT.DESCRIPTION_PLACEHOLDER}
            value={description}
            onChangeText={setDescription}
            isTextArea
            numberOfLines={4}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
              <Typography variant="label" style={styles.errorText}>
                {error}
              </Typography>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            label={TEXT.REPORT.SUBMIT}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  label: {
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.text.secondary, fontWeight: '600' },
  chipTextActive: { color: theme.colors.text.inverse },
  reasonList: { gap: theme.spacing.xs },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  reasonItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primaryLight}30`,
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
