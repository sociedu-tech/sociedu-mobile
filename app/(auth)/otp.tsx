import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { TEXT } from '../../src/core/constants/strings';
import { authService } from '../../src/core/services/authService';
import { theme } from '../../src/theme/theme';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(59);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const focusNextAvailable = (nextOtp: string[]) => {
    const nextEmptyIndex = nextOtp.findIndex((digit) => digit === '');
    if (nextEmptyIndex >= 0) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handlePasteOrChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, '');
    if (!sanitized && text.length > 0) {
      return;
    }

    if (sanitized.length > 1) {
      const nextOtp = Array(OTP_LENGTH).fill('');
      sanitized
        .slice(0, OTP_LENGTH)
        .split('')
        .forEach((digit, digitIndex) => {
          nextOtp[digitIndex] = digit;
        });
      setOtp(nextOtp);
      focusNextAvailable(nextOtp);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = sanitized;
    setOtp(nextOtp);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert(
        TEXT.AUTH_OTP.VERIFY_ERROR_TITLE,
        TEXT.AUTH_OTP.INVALID_CODE_MESSAGE,
      );
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail(code);
      Alert.alert(
        TEXT.AUTH_OTP.VERIFY_SUCCESS_TITLE,
        TEXT.AUTH_OTP.VERIFY_SUCCESS_MESSAGE,
      );
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert(
        TEXT.AUTH_OTP.VERIFY_ERROR_TITLE,
        error?.message || TEXT.AUTH_OTP.VERIFY_ERROR_MESSAGE,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!normalizedEmail) {
      Alert.alert(
        TEXT.AUTH_OTP.RESEND_ERROR_TITLE,
        TEXT.AUTH_OTP.EMAIL_REQUIRED_MESSAGE,
      );
      return;
    }

    setResending(true);
    try {
      await authService.resendVerification(normalizedEmail);
      setTimer(59);
      Alert.alert(
        TEXT.AUTH_OTP.RESEND_SUCCESS_TITLE,
        TEXT.AUTH_OTP.RESEND_SUCCESS_MESSAGE,
      );
    } catch (error: any) {
      Alert.alert(
        TEXT.AUTH_OTP.RESEND_ERROR_TITLE,
        error?.message || TEXT.AUTH_OTP.RESEND_ERROR_MESSAGE,
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>
              {TEXT.AUTH_OTP.TITLE}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              {TEXT.AUTH_OTP.SUBTITLE}
            </Typography>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                style={[styles.otpInput, digit !== '' && styles.otpInputActive]}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                value={digit}
                onChangeText={(text) => handlePasteOrChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                textAlign="center"
              />
            ))}
          </View>

          <View style={styles.timerRow}>
            <Typography variant="body" color="secondary">
              {TEXT.AUTH_OTP.RESEND_PROMPT}
            </Typography>
            {timer > 0 ? (
              <Typography variant="body" style={styles.timerText}>
                {TEXT.AUTH_OTP.RESEND_COUNTDOWN.replace('{seconds}', String(timer))}
              </Typography>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Typography variant="body" style={styles.timerText}>
                  {TEXT.AUTH_OTP.RESEND_NOW}
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          <CustomButton
            label={TEXT.AUTH_OTP.VERIFY_BUTTON}
            onPress={handleVerify}
            loading={loading || resending}
            disabled={otp.join('').length < OTP_LENGTH || loading || resending}
            style={styles.verifyBtn}
          />
        </View>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  otpInputActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  verifyBtn: {
    marginTop: 'auto',
    marginBottom: 40,
  },
});
