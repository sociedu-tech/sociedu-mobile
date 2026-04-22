import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';
import { mentorService } from '../../src/core/services/mentorService';
import { orderService } from '../../src/core/services/orderService';
import { MentorPackage, MentorPackageVersion } from '../../src/core/types';
import * as WebBrowser from 'expo-web-browser';

export default function PackageDetailScreen() {
  const { id, mentorId } = useLocalSearchParams<{ id: string, mentorId: string }>();
  const router = useRouter();

  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [selectedVer, setSelectedVer] = useState<MentorPackageVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchPackage();
  }, [id, mentorId]);

  const fetchPackage = async () => {
    if (!id || !mentorId) return;
    setLoading(true);
    setError(null);
    try {
      const packages = await mentorService.getPackages(mentorId);
      const found = packages.find(p => String(p.id) === id);
      if (found) {
        // Map DTO to UI Type (Simple version for demo)
        const uiPkg: MentorPackage = {
          id: String(found.id),
          title: found.name,
          description: found.description || '',
          isActive: found.isActive,
          versions: found.versions.map(v => ({
            id: String(v.id),
            price: v.price,
            duration: v.duration,
            deliveryType: v.deliveryType,
            isDefault: v.isDefault,
            curriculums: (v.curriculums ?? []).map(c => ({
               id: String(c.id),
               title: c.title,
               description: c.description || '',
               orderIndex: c.orderIndex,
               duration: c.duration || 0
            }))
          }))
        };
        setPkg(uiPkg);
        setSelectedVer(uiPkg.versions[0]);
      } else {
        throw new Error('Không tìm thấy gói dịch vụ.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedVer) return;
    setCheckoutLoading(true);
    try {
      const order = await orderService.checkout(Number(selectedVer.id));
      if (!order.paymentUrl) throw new Error('Payment URL not found');
      
      await WebBrowser.openBrowserAsync(order.paymentUrl);
      const finalOrder = await orderService.pollUntilPaid(order.id);
      
      if (finalOrder.status === 'paid') {
        Alert.alert('Thành công', 'Đặt chỗ thành công!', [
          { text: 'Xem lịch hẹn', onPress: () => router.replace('/(tabs)/bookings') }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !pkg) return <ErrorState error={error || 'Package not found'} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Chi tiết gói dịch vụ</Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Typography variant="h2" style={styles.title}>{pkg.title}</Typography>
          <Typography variant="body" color="secondary" style={styles.desc}>
            {pkg.description}
          </Typography>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>Chọn thời lượng</Typography>
        <View style={styles.versionContainer}>
          {pkg.versions.map(ver => {
            const isSelected = selectedVer?.id === ver.id;
            return (
              <TouchableOpacity
                key={ver.id}
                style={[styles.verCard, isSelected && styles.verCardSelected]}
                onPress={() => setSelectedVer(ver)}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>{ver.duration} phút</Typography>
                  <Typography variant="caption" color="secondary">{ver.deliveryType}</Typography>
                </View>
                <Typography variant="h3" style={{ color: theme.colors.primary }}>${ver.price}</Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedVer && (
          <>
            <Typography variant="h3" style={styles.sectionTitle}>Lộ trình chi tiết</Typography>
            {selectedVer.curriculums.map((curr, idx) => (
              <View key={curr.id} style={styles.curriculumItem}>
                <View style={styles.timeline}>
                  <View style={styles.dot} />
                  {idx < selectedVer.curriculums.length - 1 && <View style={styles.line} />}
                </View>
                <View style={styles.currContent}>
                  <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>{curr.title}</Typography>
                  <Typography variant="caption" color="secondary" style={{ marginTop: 4 }}>
                    {curr.description || 'Nội dung buổi học đang được cập nhật.'}
                  </Typography>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Typography variant="caption" color="secondary">Tổng thanh toán</Typography>
          <Typography variant="h2" style={{ color: theme.colors.primary }}>${selectedVer?.price || 0}</Typography>
        </View>
        <CustomButton
          label="Thanh toán ngay"
          onPress={handleCheckout}
          loading={checkoutLoading}
          style={{ flex: 1.5 }}
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
  scroll: { padding: 20 },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  title: { fontWeight: '800', marginBottom: 12 },
  desc: { lineHeight: 22 },
  sectionTitle: { marginBottom: 16, fontWeight: '700' },
  versionContainer: { marginBottom: 24 },
  verCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 12,
  },
  verCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '10',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  
  curriculumItem: { flexDirection: 'row', marginBottom: 20 },
  timeline: { alignItems: 'center', width: 20, marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary, marginTop: 6 },
  line: { width: 2, flex: 1, backgroundColor: theme.colors.border.default, marginVertical: 4 },
  currContent: { flex: 1, paddingTop: 2 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  }
});
