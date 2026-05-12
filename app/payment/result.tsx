import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { TEXT } from '../../src/core/constants/strings';
import { orderService } from '../../src/core/services/orderService';
import { bookingService } from '../../src/core/services/bookingService';

export default function PaymentResultScreen() {
  const router = useRouter();
  const { status, orderId, transactionRef, code } = useLocalSearchParams<{
    status?: string;
    orderId?: string;
    transactionRef?: string;
    code?: string;
  }>();

  const [resolving, setResolving] = useState(false);
  const [resolvedStatus, setResolvedStatus] = useState<'success' | 'failed'>(
    status === 'success' || status === 'paid' ? 'success' : 'failed',
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const isSuccess = resolvedStatus === 'success';

  useEffect(() => {
    const resolvePayment = async () => {
      if (!orderId) {
        setResolvedStatus('failed');
        return;
      }

      setResolving(true);
      try {
        const order = await orderService.pollUntilPaid(orderId, 5);
        if (order.status !== 'paid') {
          setResolvedStatus('failed');
          return;
        }

        setResolvedStatus('success');
        const booking = await bookingService.findByOrderId(orderId, 5, 1200);
        setBookingId(booking?.id ?? null);
      } catch {
        setResolvedStatus(status === 'success' || status === 'paid' ? 'success' : 'failed');
      } finally {
        setResolving(false);
      }
    };

    void resolvePayment();
  }, [orderId, status]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.iconWrapper, !isSuccess && styles.iconWrapperError]}>
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={80}
            color={isSuccess ? theme.colors.success : theme.colors.error}
          />
        </View>

        <Typography variant="h1" style={styles.title}>
          {isSuccess ? TEXT.PAYMENT_RESULT.SUCCESS_TITLE : TEXT.PAYMENT_RESULT.FAILURE_TITLE}
        </Typography>

        <Typography variant="body" color="secondary" style={styles.message}>
          {isSuccess ? TEXT.PAYMENT_RESULT.SUCCESS_MESSAGE : TEXT.PAYMENT_RESULT.FAILURE_MESSAGE}
        </Typography>

        {resolving ? (
          <Typography variant="caption" color="secondary" style={styles.helperText}>
            Đang xác nhận thanh toán và tìm booking vừa tạo...
          </Typography>
        ) : null}

        {orderId ? (
          <View style={styles.orderBox}>
            <Typography variant="caption" color="secondary">
              Mã đơn hàng:
            </Typography>
            <Typography variant="caption" style={styles.orderId}>
              {orderId}
            </Typography>
          </View>
        ) : null}

        {transactionRef ? (
          <Typography variant="caption" color="secondary" style={styles.metaText}>
            Mã giao dịch: {transactionRef}
          </Typography>
        ) : null}

        {code ? (
          <Typography variant="caption" color="secondary" style={styles.metaText}>
            Mã phản hồi: {code}
          </Typography>
        ) : null}
      </View>

      <View style={styles.footer}>
        {isSuccess ? (
          <>
            <CustomButton
              label={bookingId ? 'Xem booking vừa tạo' : TEXT.PAYMENT_RESULT.BTN_VIEW_BOOKINGS}
              onPress={() => router.replace(bookingId ? `/booking/${bookingId}` as any : '/(tabs)/bookings')}
              style={styles.button}
              disabled={resolving}
            />
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_HOME}
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
              style={[styles.button, { marginTop: 12 }]}
            />
          </>
        ) : (
          <>
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_RETRY}
              onPress={() => router.replace('/(tabs)')}
              style={styles.button}
            />
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_HOME}
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
              style={[styles.button, { marginTop: 12 }]}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapperError: {
    backgroundColor: `${theme.colors.error}15`,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '800',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  helperText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  orderBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  orderId: { fontWeight: '600' },
  metaText: {
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: { width: '100%' },
});
