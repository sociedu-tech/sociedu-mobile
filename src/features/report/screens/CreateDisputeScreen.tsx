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
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { TEXT } from '@/src/core/constants/strings';
import { Booking } from '@/src/core/types';
import { bookingService } from '@/src/features/booking/services/bookingService';
import { theme } from '@/src/theme/theme';

import { reportService } from '../services/reportService';

export default function CreateDisputeScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(Boolean(bookingId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setLoadingBooking(false);
      return;
    }

    setLoadingBooking(true);
    setLoadError(null);

    try {
      const data = await bookingService.getById(bookingId);
      setBooking(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Không thể tải thông tin lịch hẹn.');
    } finally {
      setLoadingBooking(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do khiếu nại.');
      return;
    }

    if (!description.trim()) {
      setError('Vui lòng mô tả chi tiết vấn đề.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reportService.createDispute({
        bookingId: booking?.id,
        reason: reason.trim(),
        description: description.trim(),
      });
      Alert.alert(TEXT.COMMON.SUCCESS, TEXT.DISPUTE.SUCCESS, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.DISPUTE.ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBooking) {
    return <LoadingState message="Đang tải thông tin..." />;
  }

  if (loadError) {
    return <ErrorState error={loadError} onRetry={fetchBooking} />;
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
            {TEXT.DISPUTE.TITLE}
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {booking ? (
            <View style={styles.bookingCard}>
              <Typography variant="label" style={styles.cardLabel}>
                {TEXT.DISPUTE.RELATED_BOOKING}
              </Typography>
              <View style={styles.bookingRow}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                    Mã đơn: {booking.orderId.slice(0, 8)}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Trạng thái: {booking.status.toUpperCase()} •{' '}
                    {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </View>
              </View>
            </View>
          ) : null}

          <TextInput
            label={TEXT.DISPUTE.REASON_LABEL}
            placeholder={TEXT.DISPUTE.REASON_PLACEHOLDER}
            value={reason}
            onChangeText={setReason}
          />

          <TextInput
            label={TEXT.DISPUTE.DESCRIPTION_LABEL}
            placeholder={TEXT.DISPUTE.DESCRIPTION_PLACEHOLDER}
            value={description}
            onChangeText={setDescription}
            isTextArea
            numberOfLines={5}
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
            label={TEXT.DISPUTE.SUBMIT}
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
  bookingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: theme.spacing.lg,
  },
  cardLabel: {
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  bookingRow: { flexDirection: 'row', alignItems: 'center' },
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
