import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { MentorPackage, MentorPackageVersion } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { mentorService } from '@/src/core/services/mentorService';

import { orderService } from '../services/orderService';

WebBrowser.maybeCompleteAuthSession();

export default function PackageDetailScreen() {
  const router = useRouter();
  const { id, mentorId } = useLocalSearchParams<{ id?: string; mentorId?: string }>();

  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<MentorPackageVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!id) {
        throw new Error('Thiếu mã gói dịch vụ.');
      }

      const data = await mentorService.getPackageDetail(id, mentorId);
      setPkg(data);
      setSelectedVersion(data.versions.find((item) => item.isDefault) ?? data.versions[0] ?? null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết gói dịch vụ.');
    } finally {
      setLoading(false);
    }
  }, [id, mentorId]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  const handleCheckout = async () => {
    if (!selectedVersion) {
      Alert.alert('Lỗi', 'Vui lòng chọn một phiên bản gói dịch vụ.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const order = await orderService.checkout(Number(selectedVersion.id));

      if (!order.paymentUrl) {
        throw new Error('Không lấy được URL thanh toán.');
      }

      await WebBrowser.openBrowserAsync(order.paymentUrl);

      const finalOrder = await orderService.pollUntilPaid(order.id, 5);
      if (finalOrder.status === 'paid') {
        Alert.alert('Thành công', 'Thanh toán thành công. Lịch hẹn đã được tạo.', [
          { text: 'Xem lịch hẹn', onPress: () => router.replace('/(tabs)/bookings') },
        ]);
      } else {
        Alert.alert('Đang chờ xác nhận', 'Vui lòng kiểm tra tab Lịch hẹn sau ít phút.', [
          { text: 'Đóng', onPress: () => router.replace('/(tabs)/bookings') },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi thanh toán', err.message || 'Đã có lỗi xảy ra trong quá trình thanh toán.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải chi tiết gói dịch vụ..." />;
  }

  if (error || !pkg) {
    return <ErrorState error={error || 'Không tìm thấy gói dịch vụ.'} onRetry={fetchPackage} />;
  }

  const curriculums = selectedVersion?.curriculums ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          Chi tiết gói dịch vụ
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Typography variant="h2" style={styles.packageTitle}>
            {pkg.title}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.packageDesc}>
            {pkg.description || 'Mentor sẽ cập nhật mô tả chi tiết cho gói học này sau.'}
          </Typography>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>
          Chọn phiên bản gói học
        </Typography>

        {pkg.versions.map((version) => {
          const isSelected = selectedVersion?.id === version.id;

          return (
            <TouchableOpacity
              key={version.id}
              style={[styles.versionCard, isSelected ? styles.versionCardSelected : null]}
              onPress={() => setSelectedVersion(version)}
              activeOpacity={0.8}
            >
              <View style={styles.radio}>
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {version.duration} phút
                </Typography>
                <Typography variant="caption" color="secondary">
                  {version.deliveryType}
                </Typography>
              </View>
              <Typography variant="h3" style={styles.versionPrice}>
                ${version.price}
              </Typography>
            </TouchableOpacity>
          );
        })}

        <Typography variant="h3" style={styles.sectionTitle}>
          Lộ trình buổi học
        </Typography>

        {curriculums.length === 0 ? (
          <Typography variant="body" color="secondary">
            Chưa có lộ trình chi tiết cho phiên bản gói học này.
          </Typography>
        ) : (
          curriculums.map((item, index) => (
            <View key={item.id} style={styles.curriculumRow}>
              <View style={styles.timeline}>
                <View style={styles.dot} />
                {index < curriculums.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.curriculumContent}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: 4 }}>
                  {item.description || 'Nội dung sẽ được mentor cập nhật thêm.'}
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: 6 }}>
                  {item.duration} phút
                </Typography>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {selectedVersion ? (
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Typography variant="caption" color="secondary">
              Tổng thanh toán
            </Typography>
            <Typography variant="h2" style={styles.footerPrice}>
              ${selectedVersion.price}
            </Typography>
          </View>
          <CustomButton
            label="Thanh toán ngay"
            onPress={handleCheckout}
            loading={checkoutLoading}
            disabled={checkoutLoading}
            style={{ flex: 1.4 }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  packageTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  packageDesc: {
    lineHeight: 22,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 12,
  },
  versionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primaryLight}20`,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  versionPrice: {
    fontWeight: '800',
    color: theme.colors.primary,
  },
  curriculumRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  timeline: {
    width: 18,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border.default,
    marginTop: 4,
  },
  curriculumContent: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  footerPrice: {
    fontWeight: '800',
    color: theme.colors.primary,
  },
});
