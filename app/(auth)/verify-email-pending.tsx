import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { authService } from '../../src/core/services/authService';
import { theme } from '../../src/theme/theme';

export default function VerifyEmailPendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Không có email', 'Không tìm thấy email để gửi lại liên kết xác minh.');
      return;
    }

    setLoading(true);
    try {
      await authService.resendVerification(email);
      Alert.alert('Đã gửi lại', 'Nếu email hợp lệ và chưa xác minh, hệ thống đã gửi lại email xác minh.');
    } catch (err: any) {
      Alert.alert('Không thể gửi lại', err.message || 'Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open" size={40} color={theme.colors.primary} />
        </View>

        <Typography variant="h1" style={styles.title}>Kiểm tra email của bạn</Typography>
        <Typography variant="body" color="secondary" style={styles.subtitle}>
          Backend hiện tại xác minh email bằng token trong liên kết email, không phải OTP 6 số.
        </Typography>

        <View style={styles.card}>
          <Typography variant="bodyMedium" style={styles.emailLabel}>{email || 'Email chưa được truyền vào màn hình.'}</Typography>
          <Typography variant="caption" color="secondary" style={styles.helper}>
            Bạn có thể bấm vào liên kết trong email hoặc mở màn hình nhập token thủ công để kiểm thử ngay.
          </Typography>

          <CustomButton
            label="Nhập token xác minh"
            variant="gradient"
            size="lg"
            onPress={() => router.push({ pathname: '/(auth)/verify-email', params: email ? { email } : undefined } as any)}
            style={styles.button}
          />

          <CustomButton
            label="Gửi lại email xác minh"
            variant="outline"
            size="lg"
            loading={loading}
            onPress={handleResend}
            style={styles.buttonSecondary}
          />

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.linkWrap}>
            <Typography variant="label" color="primary">Quay lại đăng nhập</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    ...theme.shadows.soft,
  },
  emailLabel: {
    fontWeight: '800',
    marginBottom: 8,
  },
  helper: {
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 16,
  },
  buttonSecondary: {
    marginTop: 12,
    borderRadius: 16,
  },
  linkWrap: {
    marginTop: 18,
    alignSelf: 'center',
  },
});
