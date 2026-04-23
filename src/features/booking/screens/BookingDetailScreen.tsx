import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { Booking } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { SessionCard } from '../components/SessionCard';
import { bookingService } from '../services/bookingService';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const role = useAuthStore((s) => s.userRole);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!id) {
        throw new Error('Missing Booking ID');
      }

      const data = await bookingService.getById(id);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch hẹn.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    if (!booking) {
      return;
    }

    try {
      await bookingService.updateSession(booking.id, sessionId, { status: newStatus });
      await fetchBooking();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái.');
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải lịch hẹn..." />;
  }

  if (error || !booking) {
    return <ErrorState error={error || 'Booking not found'} onRetry={fetchBooking} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Chi tiết lịch hẹn</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 32 }]}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Typography variant="caption" color="secondary">Mã đơn:</Typography>
            <Typography variant="bodyMedium" style={styles.bold}>{booking.orderId.slice(0, 8)}</Typography>
          </View>
          <View style={styles.rowBetween}>
            <Typography variant="caption" color="secondary">Ngày tạo:</Typography>
            <Typography variant="bodyMedium" style={styles.bold}>
              {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
          </View>
          <View style={styles.rowBetween}>
            <Typography variant="caption" color="secondary">Trạng thái chung:</Typography>
            <Typography variant="bodyMedium" style={[styles.bold, { color: theme.colors.primary }]}>
              {booking.status.toUpperCase()}
            </Typography>
          </View>
        </View>

        <Typography variant="h3" style={{ marginVertical: 16 }}>Danh sách buổi học</Typography>

        {booking.sessions.length === 0 ? (
          <Typography variant="bodyMedium" color="secondary">Không có buổi học nào.</Typography>
        ) : (
          booking.sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              role={role}
              onUpdateStatus={(status) => updateSessionStatus(session.id, status)}
            />
          ))
        )}
      </ScrollView>
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
    paddingBottom: 60,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
});
