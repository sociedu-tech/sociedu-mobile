import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { TEXT } from '@/src/core/constants/strings';
import { Order } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { orderService } from '../services/orderService';

function getResultCopy(order: Order) {
  switch (order.status) {
    case 'paid':
      return {
        icon: 'checkmark-circle' as const,
        color: theme.colors.success,
        title: TEXT.BOOKING.PAYMENT_SUCCESS,
        description: TEXT.BOOKING.PAYMENT_SUCCESS_DESC,
      };
    case 'cancelled':
      return {
        icon: 'close-circle' as const,
        color: theme.colors.error,
        title: TEXT.BOOKING.PAYMENT_CANCELLED,
        description: TEXT.BOOKING.PAYMENT_CANCELLED_DESC,
      };
    default:
      return {
        icon: 'time' as const,
        color: theme.colors.warning,
        title: TEXT.BOOKING.PAYMENT_PENDING,
        description: TEXT.BOOKING.PAYMENT_PENDING_DESC,
      };
  }
}

export default function PaymentResultScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async () => {
    if (!orderId) {
      setError('Thiếu mã đơn hàng.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifiedOrder = await orderService.verifyPaymentResult(orderId);
      if (verifiedOrder.status === 'pending_payment') {
        const polledOrder = await orderService.pollUntilPaid(orderId, 3);
        setOrder(polledOrder);
      } else {
        setOrder(verifiedOrder);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác minh kết quả thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    verify();
  }, [verify]);

  if (loading) {
    return <LoadingState message="Đang xác minh thanh toán..." />;
  }

  if (error || !order) {
    return <ErrorState error={error || 'Không tìm thấy đơn hàng.'} onRetry={verify} />;
  }

  const copy = getResultCopy(order);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={copy.icon} size={72} color={copy.color} />
        <Typography variant="h2" style={styles.title}>
          {copy.title}
        </Typography>
        <Typography variant="body" color="secondary" align="center" style={styles.description}>
          {copy.description}
        </Typography>
        <View style={styles.actions}>
          <CustomButton label={TEXT.BOOKING.VIEW_BOOKINGS} onPress={() => router.replace('/(tabs)/bookings')} />
          <CustomButton
            label={TEXT.COMMON.BACK_HOME}
            variant="outline"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontWeight: '800',
  },
  description: {
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
});
