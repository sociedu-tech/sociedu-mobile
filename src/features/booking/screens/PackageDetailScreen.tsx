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
import { AvailabilitySlot, MentorPackage, MentorPackageVersion } from '@/src/core/types';
import { TEXT } from '@/src/core/constants/strings';
import { mentorService } from '@/src/features/mentor/services/mentorService';
import { theme } from '@/src/theme/theme';

import { orderService } from '../services/orderService';

WebBrowser.maybeCompleteAuthSession();

function formatSlot(slot: AvailabilitySlot) {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);

  return `${start.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })} ${start.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} - ${end.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`;
}

export default function PackageDetailScreen() {
  const router = useRouter();
  const { id, mentorId } = useLocalSearchParams<{ id?: string; mentorId?: string }>();

  const [pkg, setPkg] = useState<MentorPackage | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<MentorPackageVersion | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
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
      const defaultVersion = data.versions.find((item) => item.isDefault) ?? data.versions[0] ?? null;
      setPkg(data);
      setSelectedVersion(defaultVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : TEXT.PACKAGE.PACKAGE_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [id, mentorId]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!mentorId || !selectedVersion) {
        setSlots([]);
        setSelectedSlotId(null);
        return;
      }

      setSlotsLoading(true);
      try {
        const data = await mentorService.getAvailabilitySlots(mentorId, selectedVersion.id);
        setSlots(data);
        setSelectedSlotId(data.find((slot) => slot.isAvailable)?.id ?? null);
      } catch {
        setSlots([]);
        setSelectedSlotId(null);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [mentorId, selectedVersion]);

  const handleCheckout = async () => {
    if (!selectedVersion) {
      Alert.alert('Lỗi', TEXT.PACKAGE.SELECT_VERSION);
      return;
    }

    if (slots.length > 0 && !selectedSlotId) {
      Alert.alert('Chưa chọn lịch', TEXT.PACKAGE.SELECT_SLOT);
      return;
    }

    setCheckoutLoading(true);

    try {
      const order = await orderService.checkout({
        servicePackageVersionId: selectedVersion.id,
        orderInfo:
          slots.length > 0 && selectedSlotId
            ? `${pkg?.title ?? 'Mentor package'} - ${selectedSlotId}`
            : `${pkg?.title ?? 'Mentor package'}`,
      });

      if (!order.paymentUrl) {
        throw new Error(TEXT.PACKAGE.PAYMENT_URL_ERROR);
      }

      await WebBrowser.openBrowserAsync(order.paymentUrl);
      router.replace(`/booking/payment-result?orderId=${order.id}` as never);
    } catch (err) {
      Alert.alert(
        'Lỗi thanh toán',
        err instanceof Error ? err.message : TEXT.PACKAGE.PAYMENT_ERROR
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message={TEXT.PACKAGE.PACKAGE_LOAD_LOADING} />;
  }

  if (error || !pkg) {
    return <ErrorState error={error || TEXT.PACKAGE.PACKAGE_NOT_FOUND} onRetry={fetchPackage} />;
  }

  const curriculums = selectedVersion?.curriculums ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={styles.headerTitle}>
          {TEXT.PACKAGE.DETAIL_TITLE}
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Typography variant="h2" style={styles.packageTitle}>
            {pkg.title}
          </Typography>
          <Typography variant="body" color="secondary" style={styles.packageDesc}>
            {pkg.description || TEXT.PACKAGE.DEFAULT_DESCRIPTION}
          </Typography>
        </View>

        <Typography variant="h3" style={styles.sectionTitle}>
          {TEXT.PACKAGE.VERSION_TITLE}
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
              <View style={styles.radio}>{isSelected ? <View style={styles.radioInner} /> : null}</View>
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
          {TEXT.PACKAGE.SLOT_TITLE}
        </Typography>

        {slotsLoading ? (
          <LoadingState message={TEXT.PACKAGE.SLOT_LOADING} fullScreen={false} />
        ) : slots.length === 0 ? (
          <Typography variant="body" color="secondary">
            {TEXT.PACKAGE.NO_SLOT}
          </Typography>
        ) : (
          slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  isSelected ? styles.slotCardSelected : null,
                  !slot.isAvailable ? styles.slotCardDisabled : null,
                ]}
                disabled={!slot.isAvailable}
                onPress={() => setSelectedSlotId(slot.id)}
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={slot.isAvailable ? theme.colors.primary : theme.colors.text.disabled}
                />
                <Typography
                  variant="bodyMedium"
                  color={slot.isAvailable ? 'primary' : 'disabled'}
                  style={{ marginLeft: theme.spacing.sm }}
                >
                  {formatSlot(slot)}
                </Typography>
              </TouchableOpacity>
            );
          })
        )}

        <Typography variant="h3" style={styles.sectionTitle}>
          {TEXT.PACKAGE.CURRICULUM_TITLE}
        </Typography>

        {curriculums.length === 0 ? (
          <Typography variant="body" color="secondary">
            {TEXT.PACKAGE.NO_CURRICULUM}
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
                  {item.description || TEXT.PACKAGE.DEFAULT_CURRICULUM_DESCRIPTION}
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
              {TEXT.PACKAGE.TOTAL_PAYMENT}
            </Typography>
            <Typography variant="h2" style={styles.footerPrice}>
              ${selectedVersion.price}
            </Typography>
          </View>
          <CustomButton
            label={TEXT.PACKAGE.PAY_NOW}
            onPress={handleCheckout}
            loading={checkoutLoading}
            disabled={checkoutLoading || (slots.length > 0 && !selectedSlotId)}
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
    marginTop: 4,
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
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 10,
  },
  slotCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primaryLight}20`,
  },
  slotCardDisabled: {
    opacity: 0.55,
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
