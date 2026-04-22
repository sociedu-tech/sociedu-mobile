import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { authService } from '../../src/core/services/authService';

// ─── Design Tokens (consistent with LoginScreen) ──────────────
const C = {
  dark: '#222222',
  gray: '#717171',
  blue: theme.colors.primary,
  bg: '#F3F2EF',
  surface: '#FFFFFF',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  error: '#DC2626',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  success: '#16A34A',
  divider: '#E5E7EB',
  socialBorder: '#E5E7EB',
  google: '#EA4335',
};

// ─── Field-level errors ─────────────────────────────────────
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

  // ─── Animations ──────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Validate từng field ────────────────────────────────────
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

  // ─── Register handler (mirror web handleSubmit) ───────────
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
      // Chuyển về login sau 2 giây (giống web)
      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
          {/* ═══════════════ BRANDING ═══════════════ */}
          <Animated.View style={[styles.branding, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoBox}>
              <Ionicons name="code-slash-outline" size={28} color={C.dark} />
            </View>
            <Typography variant="h1" style={styles.brandName}>UniShare</Typography>
            <Typography variant="caption" style={styles.brandTagline}>
              Sàn tri thức dành cho sinh viên
            </Typography>
          </Animated.View>

          {/* ═══════════════ FORM CARD ═══════════════ */}
          <Animated.View
            style={[
              styles.formCard,
              { opacity: formOpacity, transform: [{ translateY: formSlide }] },
            ]}
          >
            {/* Heading */}
            <View style={styles.heading}>
              <Typography variant="h2" style={styles.title}>
                Tạo tài khoản mới
              </Typography>
              <Typography variant="body" color="secondary">
                Tham gia cộng đồng UniShare ngay hôm nay.
              </Typography>
            </View>

            {/* Name Fields */}
            <TextInput
              label="HỌ"
              placeholder="Nguyễn"
              value={lastName}
              onChangeText={(v) => { setLastName(v); setFieldErrors((p) => ({ ...p, lastName: undefined })); }}
              autoCapitalize="words"
              returnKeyType="next"
              error={fieldErrors.lastName}
            />
            <TextInput
              label="TÊN"
              placeholder="Văn A"
              value={firstName}
              onChangeText={(v) => { setFirstName(v); setFieldErrors((p) => ({ ...p, firstName: undefined })); }}
              autoCapitalize="words"
              returnKeyType="next"
              error={fieldErrors.firstName}
            />

            {/* Email */}
            <TextInput
              label="EMAIL SINH VIÊN"
              leftIcon="mail-outline"
              value={email}
              onChangeText={(v) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              error={fieldErrors.email}
            />

            {/* Password */}
            <TextInput
              label="MẬT KHẨU"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={fieldErrors.password}
            />

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={C.error} />
                <Typography variant="label" style={styles.errorText}>
                  {error}
                </Typography>
              </View>
            )}

            {/* Success */}
            {success && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={C.success} />
                <Typography variant="label" style={styles.successText}>
                  Đăng ký thành công! Đang chuyển hướng...
                </Typography>
              </View>
            )}

            {/* Register Button */}
            <CustomButton
              label="Đăng ký ngay"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading || success}
              icon={!loading ? <Ionicons name="arrow-forward" size={18} color="#FFF" /> : undefined}
              onPress={handleRegister}
              style={styles.registerBtn}
            />

            {/* ═══════ DIVIDER ═══════ */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Typography variant="caption" style={styles.dividerText}>
                HOẶC TIẾP TỤC VỚI
              </Typography>
              <View style={styles.dividerLine} />
            </View>

            {/* ═══════ SOCIAL ═══════ */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color={C.google} />
                <Typography variant="label" style={styles.socialBtnText}>Google</Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-github" size={20} color={C.dark} />
                <Typography variant="label" style={styles.socialBtnText}>GitHub</Typography>
              </TouchableOpacity>
            </View>

            {/* ═══════ LOGIN LINK ═══════ */}
            <View style={styles.loginRow}>
              <Typography variant="body" color="secondary">
                Đã có tài khoản?
              </Typography>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Typography variant="bodyMedium" weight="700" style={styles.loginLink}>
                    {' '}Đăng nhập ngay
                  </Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 40,
  },

  // ── Branding ──
  branding: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -1.5,
  },
  brandTagline: {
    color: C.gray,
    marginTop: 4,
    fontWeight: '500',
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },

  // ── Heading ──
  heading: {
    marginBottom: 24,
  },
  title: {
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // ── Error ──
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: C.errorBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: C.error,
    fontWeight: '700',
    flex: 1,
  },

  // ── Success ──
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.successBg,
    borderWidth: 1,
    borderColor: C.successBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  successText: {
    color: C.success,
    fontWeight: '700',
    flex: 1,
  },

  // ── Register Button ──
  registerBtn: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  // ── Divider ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.divider,
  },
  dividerText: {
    color: C.gray,
    fontWeight: '700',
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  // ── Social ──
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.socialBorder,
    backgroundColor: C.surface,
  },
  socialBtnText: {
    color: C.dark,
    fontWeight: '700',
  },

  // ── Login Link ──
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    color: C.blue,
  },
});
