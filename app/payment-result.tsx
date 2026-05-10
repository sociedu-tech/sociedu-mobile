import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CustomButton } from '../src/components/button/CustomButton';
import { LoadingState } from '../src/components/states/LoadingState';
import { Typography } from '../src/components/typography/Typography';
import { orderService } from '../src/core/services/orderService';
import { Order } from '../src/core/types';
import { theme } from '../src/theme/theme';

type ResultState = 'success' | 'failed' | 'pending' | 'error';

const getParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{ vnp_TxnRef?: string | string[]; orderId?: string | string[] }>();
  const router = useRouter();

  const orderId = useMemo(
    () => getParamValue(params.vnp_TxnRef) || getParamValue(params.orderId),
    [params.orderId, params.vnp_TxnRef],
  );

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyPayment = useCallback(async () => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng trong kết quả thanh toán.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifiedOrder = await orderService.pollUntilPaid(orderId, 5);
      setOrder(verifiedOrder);
    } catch (err: any) {
      setError(err?.message || 'Không thể kiểm tra trạng thái thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void verifyPayment();
  }, [verifyPayment]);

  const resultState: ResultState = useMemo(() => {
    if (error) return 'error';
    if (order?.status === 'paid') return 'success';
    if (order?.status === 'failed' || order?.status === 'cancelled') return 'failed';
    return 'pending';
  }, [error, order?.status]);

  const content = useMemo(() => {
    switch (resultState) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.colors.success,
          title: 'Thanh toán thành công',
          description: 'Đơn hàng của bạn đã được xác nhận. Bạn có thể xem lịch học trong danh sách booking.',
        };
      case 'failed':
        return {
          icon: 'close-circle' as const,
          color: theme.colors.error,
          title: 'Thanh toán thất bại',
          description: 'Giao dịch chưa được hoàn tất. Bạn có thể thử lại hoặc liên hệ hỗ trợ nếu cần.',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: theme.colors.error,
          title: 'Không thể kiểm tra thanh toán',
          description: error || 'Đã có lỗi xảy ra khi kiểm tra trạng thái đơn hàng.',
        };
      default:
        return {
          icon: 'time' as const,
          color: theme.colors.warning,
          title: 'Đang xử lý',
          description: 'Hệ thống đang chờ xác nhận từ VNPay. Vui lòng kiểm tra lại sau ít phút.',
        };
    }
  }, [error, resultState]);

  if (loading) {
    return <LoadingState message="Đang kiểm tra trạng thái thanh toán..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.iconButton}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" weight="700">
          Kết quả thanh toán
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.resultBlock}>
          <View style={[styles.statusIcon, { backgroundColor: `${content.color}14` }]}>
            <Ionicons name={content.icon} size={56} color={content.color} />
          </View>
          <Typography variant="h2" align="center" style={styles.title}>
            {content.title}
          </Typography>
          <Typography variant="body" color="secondary" align="center" style={styles.description}>
            {content.description}
          </Typography>
        </View>

        {order ? (
          <View style={styles.summary}>
            <Typography variant="h3" style={styles.summaryTitle}>
              Thông tin đơn hàng
            </Typography>
            <SummaryRow label="Mã đơn" value={order.id} />
            <SummaryRow label="Số tiền" value={formatCurrency(order.totalAmount)} />
            <SummaryRow label="Trạng thái" value={getStatusLabel(order.status)} />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {resultState === 'success' ? (
          <CustomButton label="Đến chi tiết đơn" onPress={() => router.replace('/(tabs)/bookings')} />
        ) : (
          <>
            <CustomButton
              label={resultState === 'pending' ? 'Kiểm tra lại' : 'Thử lại'}
              onPress={resultState === 'pending' ? verifyPayment : router.back}
            />
            <CustomButton
              label="Liên hệ hỗ trợ"
              variant="outline"
              style={styles.secondaryButton}
              onPress={() => Linking.openURL('mailto:support@unishare.vn')}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Typography variant="body" color="secondary" style={styles.summaryLabel}>
        {label}
      </Typography>
      <Typography variant="bodyMedium" align="right" style={styles.summaryValue}>
        {value}
      </Typography>
    </View>
  );
}

function getStatusLabel(status: Order['status']) {
  const labels: Record<Order['status'], string> = {
    pending_payment: 'Đang xử lý',
    paid: 'Đã thanh toán',
    failed: 'Thất bại',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  };

  return labels[status];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  iconButton: { padding: 8, marginLeft: -8 },
  headerSpacer: { width: 40 },
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  resultBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
    maxWidth: 360,
  },
  summary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  summaryLabel: {
    flex: 0.8,
  },
  summaryValue: {
    flex: 1.2,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  secondaryButton: {
    marginTop: 12,
  },
});
