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
import { TEXT } from '../../src/core/constants/strings';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const role = useAuthStore((s) => s.userRole);

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
      setError(err.message || TEXT.BOOKING.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    if (!booking) return;
    try {
      await bookingService.updateSession(booking.id, sessionId, { status: newStatus });
      fetchBooking();
    } catch (err: any) {
      Alert.alert(TEXT.BOOKING.LINK_ERROR_TITLE, err.message || TEXT.BOOKING.UPDATE_STATUS_ERROR);
    }
  };

  if (loading) return <LoadingState message={TEXT.BOOKING.LOADING_DETAIL} />;
  if (error || !booking) return <ErrorState error={error || 'Booking not found'} onRetry={fetchBooking} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
          {TEXT.BOOKING.HEADER_DETAIL}
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 32 }]}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Typography variant="caption" color="secondary">{TEXT.BOOKING.ORDER_CODE_LABEL}</Typography>
            <Typography variant="bodyMedium" style={styles.bold}>{booking.orderId.slice(0, 8)}</Typography>
          </View>
          <View style={styles.rowBetween}>
            <Typography variant="caption" color="secondary">{TEXT.BOOKING.CREATED_AT_LABEL}</Typography>
            <Typography variant="bodyMedium" style={styles.bold}>
              {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
            </Typography>
          </View>
          <View style={styles.rowBetween}>
            <Typography variant="caption" color="secondary">{TEXT.BOOKING.OVERALL_STATUS_LABEL}</Typography>
            <Typography variant="bodyMedium" style={[styles.bold, { color: theme.colors.primary }]}>
              {booking.status.toUpperCase()}
            </Typography>
          </View>
        </View>

        <Typography variant="h3" style={{ marginVertical: 16 }}>
          {TEXT.BOOKING.TIMELINE_TITLE}
        </Typography>

        {booking.sessions.length === 0 ? (
          <Typography variant="bodyMedium" color="secondary">{TEXT.BOOKING.EMPTY_SESSIONS}</Typography>
        ) : (
          <View style={styles.timelineContainer}>
            {booking.sessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                index={index}
                role={role}
                isLast={index === booking.sessions.length - 1}
                onUpdateStatus={(status) => updateSessionStatus(session.id, status)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionCard({
  session,
  index,
  role,
  isLast,
  onUpdateStatus,
}: {
  session: BookingSession;
  index: number;
  role: string;
  isLast: boolean;
  onUpdateStatus: (status: string) => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const handleOpenMeet = () => {
    if (session.meetingUrl) {
      Linking.openURL(session.meetingUrl).catch(() => {
        Alert.alert(TEXT.BOOKING.LINK_ERROR_TITLE, TEXT.BOOKING.OPEN_MEETING_ERROR);
      });
    } else {
      Alert.alert(TEXT.BOOKING.NO_MEETING_LINK_TITLE, TEXT.BOOKING.NO_MEETING_LINK_MESSAGE);
    }
  };

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIndicator}>
        <View style={[styles.timelineDot, { backgroundColor: getStatusColor(session.status) }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Typography variant="bodyMedium" style={styles.bold}>
            {TEXT.BOOKING.SESSION_PREFIX}{index + 1}: {session.title}
          </Typography>
        </View>

        <View style={styles.rowInfo}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <Typography variant="caption" color="secondary" style={{ marginLeft: 6 }}>
            {session.scheduledAt
              ? new Date(session.scheduledAt).toLocaleString('vi-VN')
              : TEXT.BOOKING.UNSCHEDULED}
          </Typography>
        </View>

        <View style={styles.actionRow}>
          {session.status !== 'completed' ? (
            <TouchableOpacity
              style={[styles.btn, !session.meetingUrl && styles.btnDisabled]}
              onPress={handleOpenMeet}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam-outline" size={16} color="#FFF" />
              <Typography variant="caption" style={styles.btnText}>{TEXT.BOOKING.BTN_JOIN}</Typography>
            </TouchableOpacity>
          ) : (
            role !== 'mentor' && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.colors.warning }]}
                onPress={() => setShowReview(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="star-outline" size={16} color="#FFF" />
                <Typography variant="caption" style={styles.btnText}>{TEXT.BOOKING.BTN_REVIEW}</Typography>
              </TouchableOpacity>
            )
          )}

          {role === 'mentor' && session.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#10B981', marginLeft: 8 }]}
              onPress={() => onUpdateStatus('COMPLETED')}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
              <Typography variant="caption" style={styles.btnText}>{TEXT.BOOKING.BTN_COMPLETE}</Typography>
            </TouchableOpacity>
          )}
        </View>

        {showReview && (
          <View style={styles.reviewBox}>
            <Typography variant="label" style={{ marginBottom: 8, fontWeight: '700' }}>
              {TEXT.BOOKING.REVIEW_MODAL_TITLE}
            </Typography>
            <TextInput
              placeholder={TEXT.BOOKING.REVIEW_PLACEHOLDER}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={3}
            />
            <CustomButton
              label={TEXT.BOOKING.REVIEW_SUBMIT}
              onPress={() => {
                Alert.alert(TEXT.COMMON.SUCCESS, TEXT.BOOKING.REVIEW_SUCCESS);
                setShowReview(false);
              }}
              style={{ marginTop: 8 }}
            />
          </View>
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
  },
  timelineContainer: {
    paddingLeft: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 20,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    bottom: -16,
    width: 2,
    backgroundColor: theme.colors.border.default,
    zIndex: 1,
  },
  reviewBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
});
