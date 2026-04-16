import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';

import { mentorService } from '../../src/core/services/mentorService';
import { orderService } from '../../src/core/services/orderService';
import { User, MentorPackage, MentorPackageVersion } from '../../src/core/types';

// Xử lý deeplink redirect từ VNPay (nếu cấu hình scheme trong app.json)
WebBrowser.maybeCompleteAuthSession();

export default function MentorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Selected package version state
  const [selectedVer, setSelectedVer] = useState<MentorPackageVersion | null>(null);

  useEffect(() => {
    fetchMentor();
  }, [id]);

  const fetchMentor = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) throw new Error('Missing Mentor ID');
      const data = await mentorService.getProfile(id);
      setMentor(data);
      
      // Auto-select the first version of the first package
      const firstPkg = data.mentorInfo?.packages?.[0];
      if (firstPkg && firstPkg.versions?.length > 0) {
         setSelectedVer(firstPkg.versions[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết Mentor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedVer) {
      Alert.alert('Lỗi', 'Vui lòng chọn một gói dịch vụ.');
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Tạo order lấy URL VNPay
      const order = await orderService.checkout(Number(selectedVer.id));
      if (!order.paymentUrl) {
         throw new Error('Không lấy được URL thanh toán.');
      }

      // 2. Mở trình duyệt thanh toán
      // Trong thực tế cần truyền redirect_url của app (e.g. unishare://payment-result)
      const result = await WebBrowser.openBrowserAsync(order.paymentUrl);
      
      // 3. Polling từ server để kiểm tra đơn đã thanh toán chưa
      // Vì expo-web-browser chỉ trả về 'cancel' nếu user đóng, chúng ta cần poll
      // Chú ý: Ở môi trường thật, kết hợp deep linking + polling.
      const finalOrder = await orderService.pollUntilPaid(order.id, 5); // 5 x 3s = 15s chờ
      
      if (finalOrder.status === 'paid') {
        Alert.alert('Thành công', 'Thanh toán thành công. Lịch hẹn đã được tạo.', [
          { text: 'Xem lịch hẹn', onPress: () => router.replace('/(tabs)/bookings') }
        ]);
      } else {
        // Fallback: có thể webhook đã xử lý xong nhưng polling chậm. Yêu cầu user tự check.
        Alert.alert('Chờ xác nhận', 'Vui lòng kiểm tra tab Lịch hẹn sau ít phút xem đơn hàng đã được cập nhật chưa.', [
          { text: 'Đóng', onPress: () => router.replace('/(tabs)/bookings') }
        ]);
      }

    } catch (err: any) {
      Alert.alert('Lỗi thanh toán', err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <LoadingState message="Đang tải dữ liệu Mentor..." />;
  if (error || !mentor) return <ErrorState error={error || 'Profile not found'} onRetry={fetchMentor} />;

  const info = mentor.mentorInfo;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Chi tiết</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Mentor Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder} />
          <Typography variant="h2" style={styles.name}>{mentor.name}</Typography>
          <Typography variant="body" color="secondary" style={styles.headline}>
            {info?.headline || 'Chuyên gia'}
          </Typography>
          {info?.verificationStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
              <Typography variant="caption" style={{ color: '#FFF', fontWeight: '700', marginLeft: 4 }}>
                Đã xác thực
              </Typography>
            </View>
          )}
        </View>

        <Typography variant="body" style={styles.bio}>
          {mentor.bio || 'Chưa có thông tin giới thiệu.'}
        </Typography>

        <View style={styles.divider} />

        {/* Packages Area */}
        <Typography variant="h3" style={{ marginBottom: 12 }}>Các gói dịch vụ</Typography>
        
        {info?.packages?.length === 0 ? (
          <Typography variant="bodyMedium" color="secondary">Mentor chưa cung cấp gói dịch vụ nào.</Typography>
        ) : (
          info?.packages?.map(pkg => (
            <View key={pkg.id} style={styles.packageCard}>
              <Typography variant="bodyMedium" style={styles.pkgTitle}>{pkg.title}</Typography>
              <Typography variant="caption" color="secondary" style={{ marginBottom: 12 }}>{pkg.description}</Typography>
              
              {/* Versions List */}
              {pkg.versions.map(ver => {
                const isSelected = selectedVer?.id === ver.id;
                return (
                  <TouchableOpacity
                    key={ver.id}
                    style={[styles.versionItem, isSelected && styles.versionItemSelected]}
                    onPress={() => setSelectedVer(ver)}
                  >
                     <View style={styles.radio}>
                       {isSelected && <View style={styles.radioInner} />}
                     </View>
                     <View style={{ flex: 1 }}>
                       <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                         {ver.duration} phút
                       </Typography>
                       <Typography variant="caption" color="secondary">
                         {ver.deliveryType}
                       </Typography>
                     </View>
                     <Typography variant="bodyMedium" style={{ fontWeight: '800', color: theme.colors.primary }}>
                       ${ver.price}
                     </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

      </ScrollView>

      {/* Floating Checkout Button */}
      {selectedVer && (
        <View style={styles.footerWrap}>
           <View style={{ flex: 1 }}>
             <Typography variant="caption" color="secondary">Tổng thanh toán</Typography>
             <Typography variant="h2" style={{ color: theme.colors.primary }}>${selectedVer.price}</Typography>
           </View>
           <CustomButton 
             label="Thanh toán ngay"
             onPress={handleCheckout}
             loading={checkoutLoading}
             disabled={checkoutLoading}
             style={{ flex: 1.5 }}
           />
        </View>
      )}
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
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.border.default,
    marginBottom: 12,
  },
  name: {
    fontWeight: '800',
    marginBottom: 4,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  bio: {
    lineHeight: 22,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: 24,
  },
  packageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 16,
  },
  pkgTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 8,
  },
  versionItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '20', // Transparent hex
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  }
});
