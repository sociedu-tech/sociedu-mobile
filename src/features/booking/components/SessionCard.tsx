import React from 'react';
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/src/components/typography/Typography';
import { BookingSession } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

interface SessionCardProps {
  session: BookingSession;
  index: number;
  role: string;
  onUpdateStatus: (status: string) => void;
}

export function SessionCard({ session, index, role, onUpdateStatus }: SessionCardProps) {
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
        Alert.alert('Loi', 'Khong the mo link meeting.');
      });
      return;
    }

    Alert.alert('Chua co link', 'Mentor chua cung cap link.');
  };

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Typography variant="bodyMedium" style={styles.bold}>
          Buoi {index + 1}: {session.title}
        </Typography>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(session.status) }]} />
      </View>

      <View style={styles.rowInfo}>
        <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
        <Typography variant="caption" color="secondary" style={{ marginLeft: 6 }}>
          {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString('vi-VN') : 'Chua xep lich'}
        </Typography>
      </View>

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
            <Typography variant="caption" style={styles.btnText}>Hoan thanh</Typography>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
  },
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
});
