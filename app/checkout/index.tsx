import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';
import { TEXT } from '../../src/core/constants/strings';
import { mentorService } from '../../src/core/services/mentorService';
import { orderService } from '../../src/core/services/orderService';
import { MentorPackage, MentorPackageVersion, User } from '../../src/core/types';
import { toPackage } from '../../src/core/adapters/mentorAdapter';
import { BACKEND_CONFIG } from '../../src/core/config';

WebBrowser.maybeCompleteAuthSession();

export default function CheckoutScreen() {
  const router = useRouter();
  const { packageId, versionId, mentorId } = useLocalSearchParams<{
    packageId: string;
    versionId: string;
    mentorId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentor, setMentor] = useState<User | null>(null);
  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [version, setVersion] = useState<MentorPackageVersion | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!packageId || !versionId || !mentorId) {
        throw new Error(TEXT.PACKAGE_DETAIL.NOT_FOUND);
      }

      const [mentorData, packages] = await Promise.all([
        mentorService.getProfile(mentorId),
        mentorService.getPackages(mentorId),
      ]);

      const foundPkgDto = packages.find((item) => String(item.id) === packageId);
      if (!foundPkgDto) throw new Error(TEXT.PACKAGE_DETAIL.NOT_FOUND);

      const uiPkg = toPackage(foundPkgDto);
      const foundVer = uiPkg.versions.find((item) => String(item.id) === versionId);
      if (!foundVer) throw new Error(TEXT.PACKAGE_DETAIL.NOT_FOUND);

      setMentor(mentorData);
      setPkg(uiPkg);
      setVersion(foundVer);
    } catch (err: any) {
      setError(err?.message || TEXT.COMMON.ERROR);
    } finally {
      setLoading(false);
    }
  }, [mentorId, packageId, versionId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handlePay = async () => {
    if (!version) return;

    setCheckoutLoading(true);
    try {
      const order = await orderService.checkout(version.id);
      if (!order.paymentUrl) {
        throw new Error(TEXT.PACKAGE_DETAIL.PAYMENT_URL_MISSING);
      }

      const returnUrl = BACKEND_CONFIG.vnpayReturnScheme;
      const result = await WebBrowser.openAuthSessionAsync(order.paymentUrl, returnUrl);

      if (result.type !== 'success' || !result.url) {
        router.replace({
          pathname: '/payment/result',
          params: {
            status: 'failed',
            orderId: order.id,
            source: 'browser',
          },
        });
        return;
      }

      const callback = Linking.parse(result.url);
      const status = Array.isArray(callback.queryParams?.status)
        ? callback.queryParams.status[0]
        : callback.queryParams?.status;
      const callbackOrderId = Array.isArray(callback.queryParams?.orderId)
        ? callback.queryParams.orderId[0]
        : callback.queryParams?.orderId;
      const code = Array.isArray(callback.queryParams?.code)
        ? callback.queryParams.code[0]
        : callback.queryParams?.code;
      const transactionRef = Array.isArray(callback.queryParams?.transactionRef)
        ? callback.queryParams.transactionRef[0]
        : callback.queryParams?.transactionRef;

      router.replace({
        pathname: '/payment/result',
        params: {
          status: status ?? 'pending',
          orderId: callbackOrderId ?? order.id,
          code: code ?? '',
          transactionRef: transactionRef ?? '',
          source: 'callback',
        },
      });
    } catch (err: any) {
      Alert.alert(TEXT.PACKAGE_DETAIL.ERROR_TITLE, err?.message || TEXT.COMMON.ERROR);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !pkg || !version || !mentor) {
    return <ErrorState error={error || TEXT.PACKAGE_DETAIL.NOT_FOUND} onRetry={fetchData} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.CHECKOUT.HEADER_TITLE}
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Typography variant="h3" style={styles.sectionTitle}>
          {TEXT.CHECKOUT.SUMMARY_TITLE}
        </Typography>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Typography variant="caption" color="secondary">
              {TEXT.CHECKOUT.PACKAGE_LABEL}
            </Typography>
            <Typography variant="bodyMedium" style={styles.bold}>
              {pkg.title}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography variant="caption" color="secondary">
              {TEXT.CHECKOUT.MENTOR_LABEL}
            </Typography>
            <Typography variant="bodyMedium" style={styles.bold}>
              {mentor.name}
            </Typography>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Typography variant="bodyMedium" style={styles.bold}>
              Thời lượng
            </Typography>
            <Typography variant="bodyMedium">
              {version.duration} phút ({version.deliveryType})
            </Typography>
          </View>

          <View style={[styles.infoRow, { marginTop: 12 }]}>
            <Typography variant="h3">{TEXT.CHECKOUT.TOTAL_LABEL}</Typography>
            <Typography variant="h2" color="primary">
              ${version.price}
            </Typography>
          </View>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>
          {TEXT.CHECKOUT.PAYMENT_METHOD_TITLE}
        </Typography>

        <View style={styles.card}>
          <View style={styles.methodRow}>
            <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
            <Typography variant="bodyMedium" style={styles.methodText}>
              Thanh toán trực tuyến qua VNPay
            </Typography>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label={TEXT.CHECKOUT.BTN_PAY}
          onPress={handlePay}
          loading={checkoutLoading}
          style={styles.payButton}
        />
      </View>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontWeight: '700' },
  headerSpacer: { width: 40 },
  scroll: { padding: 20 },
  sectionTitle: { marginBottom: 16, fontWeight: '700', marginTop: 8 },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bold: { fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: 16,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    flex: 1,
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  payButton: { width: '100%' },
});
