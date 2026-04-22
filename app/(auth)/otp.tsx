import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const newOtp = text.slice(0, 6).split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const code = otp.join('');
    if (code.length < 6) return;

    setLoading(true);
    // Giả lập verify OTP
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/login');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>Xác thực OTP</Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              Mã xác thực đã được gửi đến email của bạn. Vui lòng nhập mã để tiếp tục.
            </Typography>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                style={[
                  styles.otpInput,
                  digit !== '' && styles.otpInputActive
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                textAlign="center"
              />
            ))}
          </View>

          <View style={styles.timerRow}>
            <Typography variant="body" color="secondary">Không nhận được mã? </Typography>
            {timer > 0 ? (
              <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                Gửi lại sau {timer}s
              </Typography>
            ) : (
              <TouchableOpacity onPress={() => setTimer(59)}>
                <Typography variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  Gửi lại ngay
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          <CustomButton
            label="Xác nhận"
            onPress={handleVerify}
            loading={loading}
            disabled={otp.join('').length < 6 || loading}
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
  verifyBtn: {
    marginTop: 'auto',
    marginBottom: 40,
  },
});
