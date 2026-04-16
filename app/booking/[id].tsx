import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../src/components/typography/Typography';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';

import { bookingService } from '../../src/core/services/bookingService';
import { useAuthStore } from '../../src/core/store/authStore';
import { Booking, BookingSession } from '../../src/core/types';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const role = useAuthStore(s => s.userRole);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) throw new Error('Missing Booking ID');
      const data = await bookingService.getById(id);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    if (!booking) return;
    try {
      await bookingService.updateSession(booking.id, sessionId, { status: newStatus });
      fetchBooking(); // Refresh
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái.');
    }
  };

  if (loading) return <LoadingState message="Đang tải lịch hẹn..." />;
  if (error || !booking) return <ErrorState error={error || 'Booking not found'} onRetry={fetchBooking} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Chi tiết Lịch hẹn</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 32 }]}> // Đẩy xuống rõ ràng hơn

        {/* General Info */}
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

        <Typography variant="h3" style={{ marginVertical: 16 }}>Danh sách Buổi học</Typography>

        {booking.sessions.length === 0 ? (
          <Typography variant="bodyMedium" color="secondary">Không có buổi học nào.</Typography>
        ) : (
          booking.sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              role={role}
              onUpdateStatus={(st) => updateSessionStatus(session.id, st)}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-component: SessionCard ──────────────────────────────
function SessionCard({ session, index, role, onUpdateStatus }: {
  session: BookingSession;
  index: number;
  role: string;
  onUpdateStatus: (s: string) => void;
}) {
  const getStatusColor = (st: string) => {
    switch (st) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B'; // pending
    }
  };

  const handleOpenMeet = () => {
    if (session.meetingUrl) {
      Linking.openURL(session.meetingUrl).catch(() => {
        Alert.alert('Lỗi', 'Không thể mở Link meeting.');
      });
    } else {
      Alert.alert('Chưa có Link', 'Mentor chưa cung cấp link.');
    }
  };

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Typography variant="bodyMedium" style={styles.bold}>Buổi {index + 1}: {session.title}</Typography>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(session.status) }]} />
      </View>

      <View style={styles.rowInfo}>
        <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
        <Typography variant="caption" color="secondary" style={{ marginLeft: 6 }}>
          {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString('vi-VN') : 'Chưa xếp lịch'}
        </Typography>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.btn, !session.meetingUrl && styles.btnDisabled]}
          onPress={handleOpenMeet}
          activeOpacity={0.7}
        >
          <Ionicons name="videocam-outline" size={16} color="#FFF" />
          <Typography variant="caption" style={styles.btnText}>Tham gia Meeting</Typography>
        </TouchableOpacity>

        {role === 'mentor' && session.status !== 'completed' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#10B981', marginLeft: 8 }]}
            onPress={() => onUpdateStatus('COMPLETED')}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
            <Typography variant="caption" style={styles.btnText}>Hoàn thành</Typography>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  scroll: { padding: 20, paddingBottom: 60 },
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
  bold: { fontWeight: '700' },
  sessionCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnDisabled: {
    backgroundColor: theme.colors.text.disabled,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  }
});
