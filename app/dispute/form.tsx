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
import { disputeService } from '../../src/core/services/disputeService';

export default function DisputeFormScreen() {
  const router = useRouter();
  const { bookingId, sessionId } = useLocalSearchParams<{
    bookingId: string;
    sessionId?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
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
      await disputeService.createDispute({
        bookingId,
        sessionId,
        reason: reason.trim(),
      });

      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.DISPUTE.SUCCESS_MESSAGE, [
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
                {TEXT.DISPUTE.FORM_TITLE}
              </Typography>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color={theme.colors.warning} />
                <Typography variant="caption" style={styles.warningText}>
                  Khiếu nại sẽ được Admin xem xét và xử lý. Vui lòng cung cấp lý do chính xác để bảo vệ quyền lợi của bạn.
                </Typography>
              </View>

              <View style={styles.section}>
                <Typography variant="caption" color="secondary" style={styles.label}>
                  Đối tượng khiếu nại
                </Typography>
                <View style={styles.targetBadge}>
                  <Typography variant="bodyMedium" style={styles.targetText}>
                    {sessionId ? `Session: ${sessionId}` : `Booking: ${bookingId}`}
                  </Typography>
                </View>

                <TextInput
                  label={TEXT.DISPUTE.REASON_LABEL}
                  placeholder={TEXT.DISPUTE.REASON_PLACEHOLDER}
                  value={reason}
                  onChangeText={setReason}
                  error={errors.reason}
                  multiline
                  numberOfLines={6}
                  style={styles.textArea}
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <CustomButton
                label={TEXT.DISPUTE.BTN_SUBMIT}
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 20,
    alignItems: 'center',
  },
  warningText: { flex: 1, marginLeft: 12, color: '#9A3412' },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
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
  textArea: { height: 150, textAlignVertical: 'top' },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
});
