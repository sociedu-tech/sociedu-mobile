import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { authService } from '../../src/core/services/authService';

interface FieldErrors {
  lastName?: string;
  firstName?: string;
  email?: string;
  password?: string;
}

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateFields = (): boolean => {
    const errs: FieldErrors = {};
    if (!lastName.trim()) errs.lastName = 'Họ không được để trống.';
    if (!firstName.trim()) errs.firstName = 'Tên không được để trống.';
    if (!email.trim()) {
      errs.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Email không đúng định dạng.';
    }
    if (!password) {
      errs.password = 'Mật khẩu không được để trống.';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    setLoading(true);
    setError(null);
    try {
      await authService.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSuccess(true);
      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <LinearGradient colors={[theme.colors.primary, '#7C3AED']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* BRANDING */}
            <Animated.View style={[styles.branding, { opacity: fadeAnim }]}>
              <View style={styles.logoCircle}>
                <Ionicons name="sparkles" size={32} color={theme.colors.primary} />
              </View>
              <Typography variant="h1" style={{ color: '#FFF', fontWeight: '900', fontSize: 32 }}>Tham gia UniShare</Typography>
              <Typography variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>Khám phá tri thức cùng cộng đồng</Typography>
            </Animated.View>

            {/* FORM CARD */}
            <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Typography variant="h2" style={styles.title}>Tạo tài khoản</Typography>
              
              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="HỌ"
                      placeholder="Nguyễn"
                      value={lastName}
                      onChangeText={v => { setLastName(v); setFieldErrors(p => ({ ...p, lastName: undefined })); }}
                      error={fieldErrors.lastName}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="TÊN"
                      placeholder="Văn A"
                      value={firstName}
                      onChangeText={v => { setFirstName(v); setFieldErrors(p => ({ ...p, firstName: undefined })); }}
                      error={fieldErrors.firstName}
                    />
                  </View>
                </View>

                <TextInput
                  label="EMAIL"
                  placeholder="name@university.edu"
                  leftIcon="mail"
                  value={email}
                  onChangeText={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: undefined })); }}
                  keyboardType="email-address"
                  error={fieldErrors.email}
                />

                <TextInput
                  label="MẬT KHẨU"
                  placeholder="••••••••"
                  leftIcon="lock-closed"
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={password}
                  onChangeText={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  error={fieldErrors.password}
                />
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                  <Typography variant="caption" style={{ color: theme.colors.error, fontWeight: '700' }}>{error}</Typography>
                </View>
              )}

              {success && (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Typography variant="caption" style={{ color: theme.colors.success, fontWeight: '700' }}>Đăng ký thành công! Đang chuyển hướng...</Typography>
                </View>
              )}

              <CustomButton
                label="Đăng ký ngay"
                variant="gradient"
                size="lg"
                loading={loading}
                disabled={success}
                onPress={handleRegister}
                style={styles.registerBtn}
              />

              <View style={styles.footerRow}>
                <Typography variant="body" color="secondary">Đã có tài khoản?</Typography>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity><Typography variant="body" style={{ fontWeight: '800', color: theme.colors.primary }}> Đăng nhập ngay</Typography></TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 40 },
  branding: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 64, height: 64, borderRadius: 24, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...theme.shadows.medium },
  card: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, ...theme.shadows.medium },
  title: { fontWeight: '900', color: theme.colors.text.primary, marginBottom: 20 },
  form: { gap: 12 },
  row: { flexDirection: 'row' },
  registerBtn: { marginTop: 24, borderRadius: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F2', padding: 12, borderRadius: 12, marginTop: 16, gap: 8 },
  successBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, marginTop: 16, gap: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
});
