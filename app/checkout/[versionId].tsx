import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { CustomButton } from '../../src/components/button/CustomButton';
import { Checkbox } from '../../src/components/form/Checkbox';
import { ErrorState } from '../../src/components/states/ErrorState';
import { LoadingState } from '../../src/components/states/LoadingState';
import { Avatar } from '../../src/components/ui/Avatar';
import { Typography } from '../../src/components/typography/Typography';
import { toPackage } from '../../src/core/adapters/mentorAdapter';
import { mentorService } from '../../src/core/services/mentorService';
import { orderService } from '../../src/core/services/orderService';
import { MentorPackage, MentorPackageVersion, User } from '../../src/core/types';
import { theme } from '../../src/theme/theme';

const PLATFORM_FEE = 0;

const getParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const getInitials = (name?: string) =>
  (name || 'Mentor')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const getDeliveryLabel = (deliveryType: string) => {
  const normalized = deliveryType.toUpperCase();
  if (normalized === 'ONLINE') return 'Trực tuyến';
  if (normalized === 'OFFLINE') return 'Trực tiếp';
  if (normalized === 'HYBRID') return 'Linh hoạt';
  return deliveryType;
};

const getDeliveryDescription = (deliveryType: string) => {
  const normalized = deliveryType.toUpperCase();
  if (normalized === 'ONLINE') {
    return 'Học trực tuyến qua liên kết được cung cấp sau khi đặt lịch.';
  }
  if (normalized === 'OFFLINE') {
    return 'Học trực tiếp theo địa điểm hai bên thống nhất.';
  }
  if (normalized === 'HYBRID') {
    return 'Có thể học trực tuyến hoặc trực tiếp tùy lịch hẹn.';
  }
  return 'Hình thức học sẽ được mentor xác nhận trong quá trình đặt lịch.';
};

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    versionId?: string | string[];
    packageId?: string | string[];
    mentorId?: string | string[];
  }>();
  const router = useRouter();

  const versionId = getParamValue(params.versionId);
  const packageId = getParamValue(params.packageId);
  const mentorId = getParamValue(params.mentorId);

  const [mentor, setMentor] = useState<User | null>(null);
  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [version, setVersion] = useState<MentorPackageVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openingPayment, setOpeningPayment] = useState(false);

  const basePrice = version?.price ?? 0;
  const totalPrice = basePrice + PLATFORM_FEE;

  const loadCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSubmitError(null);

    try {
      if (!versionId || !packageId || !mentorId) {
        throw new Error('Không tìm thấy thông tin gói học để thanh toán.');
      }

      const [mentorData, packageDtos] = await Promise.all([
        mentorService.getProfile(mentorId),
        mentorService.getPackages(mentorId),
      ]);
      const foundPackageDto = packageDtos.find((item) => String(item.id) === String(packageId));

      if (!foundPackageDto) {
        throw new Error('Gói học không còn khả dụng.');
      }

      const uiPackage = toPackage(foundPackageDto);
      const foundVersion = uiPackage.versions.find((item) => String(item.id) === String(versionId));

      if (!foundVersion) {
        throw new Error('Phiên bản gói học không còn khả dụng.');
      }

      setMentor(mentorData);
      setPkg(uiPackage);
      setVersion(foundVersion);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [mentorId, packageId, versionId]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleConfirmPayment = useCallback(() => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Bạn sẽ được chuyển đến VNPay để hoàn tất giao dịch.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiếp tục',
          onPress: async () => {
            if (!versionId) return;

            setSubmitting(true);
            setSubmitError(null);

            try {
              const order = await orderService.checkout(Number(versionId));
              if (!order.paymentUrl) {
                throw new Error('Không nhận được đường dẫn thanh toán từ hệ thống.');
              }

              setOpeningPayment(true);
              const result = await WebBrowser.openBrowserAsync(order.paymentUrl);
              setOpeningPayment(false);

              if (result.type === 'cancel') {
                setToastMessage('Bạn đã hủy thanh toán');
                return;
              }

              router.push({
                pathname: '/payment-result',
                params: { orderId: order.id },
              } as any);
            } catch (err: any) {
              setOpeningPayment(false);
              setSubmitError(err?.message || 'Không thể tạo đơn thanh toán. Vui lòng thử lại.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  }, [router, versionId]);

  const deliveryText = useMemo(
    () => (version ? getDeliveryDescription(version.deliveryType) : ''),
    [version],
  );

  if (loading) return <LoadingState message="Đang tải thông tin thanh toán..." />;
  if (error || !mentor || !pkg || !version) {
    return <ErrorState error={error || 'Không thể tải thông tin thanh toán.'} onRetry={loadCheckout} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" weight="700">
          Xác nhận thanh toán
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Mentor
          </Typography>
          <View style={styles.mentorRow}>
            <Avatar uri={mentor.avatar} initials={getInitials(mentor.name)} size={56} />
            <View style={styles.mentorInfo}>
              <Typography variant="bodyMedium" weight="700">
                {mentor.name || 'Mentor'}
              </Typography>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
                <Typography variant="caption" color="secondary" style={styles.ratingText}>
                  {(mentor.mentorInfo?.rating ?? mentor.rating ?? 0).toFixed(1)}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Gói học
          </Typography>
          <Typography variant="bodyMedium" weight="700">
            {pkg.title}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.packageDescription}>
            {pkg.description}
          </Typography>
          <InfoRow label="Thời lượng" value={`${version.duration} phút`} />
          <InfoRow label="Hình thức" value={getDeliveryLabel(version.deliveryType)} />
          <InfoRow label="Phiên bản" value={`#${version.id}`} />
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Chi phí
          </Typography>
          <InfoRow label="Giá gói học" value={formatCurrency(basePrice)} />
          <InfoRow label="Phí nền tảng" value={formatCurrency(PLATFORM_FEE)} />
          <View style={styles.totalRow}>
            <Typography variant="bodyMedium" weight="700">
              Tổng thanh toán
            </Typography>
            <Typography variant="h3" style={styles.totalPrice}>
              {formatCurrency(totalPrice)}
            </Typography>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Hình thức học
          </Typography>
          <Typography variant="body" color="secondary" style={styles.policyText}>
            {deliveryText}
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Hủy lịch & hoàn tiền
          </Typography>
          <Typography variant="body" color="secondary" style={styles.policyText}>
            Việc hủy lịch và hoàn tiền phụ thuộc vào xác nhận của mentor và chính sách nền tảng.
            Nếu giao dịch có vấn đề, vui lòng liên hệ hỗ trợ để được xử lý.
          </Typography>
        </View>

        <View style={styles.termsBox}>
          <Checkbox
            value={acceptedTerms}
            onValueChange={setAcceptedTerms}
            disabled={submitting}
            label="Tôi đã đọc và đồng ý với điều khoản thanh toán"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {submitError ? (
          <Typography variant="caption" color="error" style={styles.submitError}>
            {submitError}
          </Typography>
        ) : null}
        <CustomButton
          label="Xác nhận thanh toán"
          onPress={handleConfirmPayment}
          loading={submitting && !openingPayment}
          disabled={!acceptedTerms || submitting || openingPayment}
        />
      </View>

      {toastMessage ? (
        <View style={styles.toast}>
          <Typography variant="bodyMedium" color="inverse" align="center">
            {toastMessage}
          </Typography>
        </View>
      ) : null}

      {openingPayment ? (
        <View style={styles.paymentOverlay}>
          <LoadingState message="Đang mở cổng thanh toán..." fullScreen={false} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Typography variant="body" color="secondary" style={styles.infoLabel}>
        {label}
      </Typography>
      <Typography variant="bodyMedium" align="right" style={styles.infoValue}>
        {value}
      </Typography>
    </View>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerSpacer: { width: 40 },
  scroll: {
    padding: 20,
    paddingBottom: 28,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
  },
  packageDescription: {
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderTopColor: theme.colors.border.default,
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  infoLabel: {
    flex: 0.9,
  },
  infoValue: {
    flex: 1.1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: theme.colors.border.default,
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 4,
  },
  totalPrice: {
    color: theme.colors.primary,
  },
  policyText: {
    lineHeight: 22,
  },
  termsBox: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  submitError: {
    marginBottom: 12,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 96,
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paymentOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.92)',
  },
});
