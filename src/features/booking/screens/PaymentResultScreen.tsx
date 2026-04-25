import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { Order } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { orderService } from '../services/orderService';

function getResultCopy(order: Order) {
  switch (order.status) {
    case 'paid':
      return {
        icon: 'checkmark-circle',
        color: theme.colors.success,
        title: 'Thanh toán thành công',
        description: 'Lịch hẹn đã được tạo. Bạn có thể xem chi tiết trong tab Lịch hẹn.',
      } as const;
    case 'cancelled':
      return {
        icon: 'close-circle',
        color: theme.colors.error,
        title: 'Thanh toán đã hủy',
        description: 'Giao dịch chưa hoàn tất. Bạn có thể quay lại gói học để thử lại.',
      } as const;
    default:
      return {
        icon: 'time',
        color: theme.colors.warning,
        title: 'Đang chờ xác nhận',
        description: 'Hệ thống đang xác minh kết quả thanh toán. Vui lòng kiểm tra lại sau ít phút.',
      } as const;
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
          <CustomButton label="Xem lịch hẹn" onPress={() => router.replace('/(tabs)/bookings')} />
          <CustomButton
            label="Về trang chủ"
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
