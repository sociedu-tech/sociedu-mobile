import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
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

import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { TextInput } from '../../src/components/form/TextInput';
import { theme } from '../../src/theme/theme';
import { TEXT } from '../../src/core/constants/strings';
import { reportService } from '../../src/core/services/reportService';
import { ReportType } from '../../src/core/types';

export default function ReportFormScreen() {
  const router = useRouter();
  const { targetType, targetId } = useLocalSearchParams<{
    targetType: ReportType;
    targetId: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!reason.trim()) nextErrors.reason = TEXT.VALIDATION.REQUIRED;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await reportService.createReport({
        targetType,
        targetId,
        reason: reason.trim(),
        description: description.trim(),
      });

      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.REPORT.SUCCESS_MESSAGE, [
        {
          text: TEXT.COMMON.CONFIRM,
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(TEXT.COMMON.ERROR, error?.message || TEXT.COMMON.ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Typography variant="bodyMedium" style={styles.headerTitle}>
                {TEXT.REPORT.FORM_TITLE}
              </Typography>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.section}>
                <Typography variant="caption" color="secondary" style={styles.label}>
                  {TEXT.REPORT.TARGET_LABEL}
                </Typography>
                <View style={styles.targetBadge}>
                  <Typography variant="bodyMedium" style={styles.targetText}>
                    {targetType?.toUpperCase()}: {targetId}
                  </Typography>
                </View>

                <TextInput
                  label={TEXT.REPORT.REASON_LABEL}
                  placeholder={TEXT.REPORT.REASON_PLACEHOLDER}
                  value={reason}
                  onChangeText={setReason}
                  error={errors.reason}
                />

                <TextInput
                  label={TEXT.REPORT.DESC_LABEL}
                  placeholder={TEXT.REPORT.DESC_PLACEHOLDER}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  style={styles.textArea}
                />
              </View>

              <View style={styles.section}>
                <Typography variant="caption" color="secondary" style={styles.label}>
                  {TEXT.REPORT.EVIDENCE_LABEL}
                </Typography>
                <TouchableOpacity style={styles.uploadBtn}>
                  <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
                  <Typography variant="caption" color="primary" style={{ marginTop: 8 }}>
                    Thêm hình ảnh
                  </Typography>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <CustomButton
                label={TEXT.REPORT.BTN_SUBMIT}
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontWeight: '700' },
  scroll: { padding: 20 },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  label: { marginBottom: 12, fontWeight: '600' },
  targetBadge: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  targetText: { fontWeight: '600', color: theme.colors.secondary },
  textArea: { height: 120, textAlignVertical: 'top' },
  uploadBtn: {
    height: 100,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primaryLight}10`,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
});
