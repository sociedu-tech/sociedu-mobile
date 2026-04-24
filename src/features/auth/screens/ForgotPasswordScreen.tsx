import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { TextInput } from '@/src/components/form/TextInput';
import { Typography } from '@/src/components/typography/Typography';
import { theme } from '@/src/theme/theme';

import { authService } from '../services/authService';

const colors = {
  bg: '#F3F2EF',
  surface: '#FFFFFF',
  dark: '#222222',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email để nhận mã OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email.trim());
      router.push({
        pathname: '/(auth)/otp',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.dark} />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="mail-open-outline" size={30} color={theme.colors.primary} />
            </View>

            <Typography variant="h2" style={styles.title}>
              Quên mật khẩu?
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              Nhập email đăng ký để nhận mã OTP đặt lại mật khẩu.
            </Typography>

            <TextInput
              label="EMAIL"
              placeholder="name@university.edu.vn"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Typography variant="label" style={styles.errorText}>
                  {error}
                </Typography>
              </View>
            ) : null}

            <CustomButton
              label="Gửi mã OTP"
              loading={loading}
              disabled={loading}
              onPress={handleContinue}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.dark,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontWeight: '700',
    flex: 1,
  },
  submitBtn: {
    borderRadius: 16,
  },
});
