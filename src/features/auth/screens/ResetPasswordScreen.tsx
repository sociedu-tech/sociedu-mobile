import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

import { authService } from '../services/authService';

const colors = {
  bg: '#F3F2EF',
  surface: '#FFFFFF',
  dark: '#222222',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  success: '#16A34A',
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, resetToken } = useLocalSearchParams<{ email?: string; resetToken?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!resetToken) {
      router.replace('/(auth)/forgot-password');
    }
  }, [resetToken, router]);

  const handleSubmit = async () => {
    if (!resetToken) {
      setError('Phiên đặt lại mật khẩu không hợp lệ.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.completeResetPassword({
        resetToken,
        newPassword: password,
      });
      setSuccess(result.message || 'Đặt lại mật khẩu thành công.');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu.');
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
            <Typography variant="h2" style={styles.title}>
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              {email ? `Tạo mật khẩu mới cho ${email}.` : 'Tạo mật khẩu mới cho tài khoản của bạn.'}
            </Typography>

            <TextInput
              label="MẬT KHẨU MỚI"
              placeholder="Nhập mật khẩu mới"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TextInput
              label="XÁC NHẬN MẬT KHẨU"
              placeholder="Nhập lại mật khẩu mới"
              leftIcon="shield-checkmark-outline"
              rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Typography variant="label" style={styles.errorText}>
                  {error}
                </Typography>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Typography variant="label" style={styles.successText}>
                  {success}
                </Typography>
              </View>
            ) : null}

            <CustomButton
              label="Cập nhật mật khẩu"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || Boolean(success)}
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  successText: {
    color: colors.success,
    fontWeight: '700',
    flex: 1,
  },
  submitBtn: {
    borderRadius: 16,
  },
});
