import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { authService } from '../../src/core/services/authService';
import { theme } from '../../src/theme/theme';

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    const normalizedPhone = phoneNumber.trim();
    if (!normalizedPhone) {
      setError('Vui lòng nhập số điện thoại cần xác thực.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.sendPhoneVerificationOtp({ phoneNumber: normalizedPhone });
      Alert.alert('Đã gửi OTP', 'Backend đã gửi OTP qua email tài khoản của bạn.');
      router.push({
        pathname: '/(auth)/otp',
        params: { mode: 'phone-verify', phoneNumber: normalizedPhone },
      } as any);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi OTP xác thực số điện thoại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <Typography variant="h1" style={styles.title}>Xác thực số điện thoại</Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Luồng này yêu cầu đăng nhập trước. Backend sẽ gửi OTP 6 số tới email tài khoản, sau đó bạn nhập lại mã để gắn số điện thoại.
          </Typography>

          <View style={styles.card}>
            <TextInput
              label="SỐ ĐIỆN THOẠI"
              placeholder="Nhập số điện thoại cần xác thực"
              leftIcon="call"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              error={error ?? undefined}
            />

            <CustomButton
              label="Gửi OTP xác thực"
              variant="gradient"
              size="lg"
              loading={loading}
              onPress={handleSendOtp}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  title: {
    fontWeight: '900',
    marginBottom: 8,
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
  button: {
    marginTop: 8,
    borderRadius: 16,
  },
});
