import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';
import { authService } from '../../src/core/services/authService';

/**
 * 🛠️ PRODUCTION DESIGN SYSTEM
 */
const DESIGN = {
  spacing: {
    container: 24,
    gap: 16,
    xl: 40,
  },
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: theme.colors.primary,
    secondary: '#64748B',
    error: '#EF4444',
    border: '#E2E8F0',
  },
  radius: {
    card: 32,
    button: 16,
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    // 1. Reset & Validate
    setError(null);
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Vui lòng nhập email.';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu.';
    
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    // 2. API Call
    setLoading(true);
    try {
      const data = await authService.login({ email: email.trim(), password });
      storeLogin(data);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* BRANDING */}
          <View style={styles.branding}>
            <View style={styles.logoBox}>
              <Ionicons name="code-slash" size={32} color={DESIGN.colors.primary} />
            </View>
            <Typography variant="h1" style={styles.appName}>UniShare</Typography>
            <Typography variant="body" color="secondary">Học tập & Kết nối tri thức</Typography>
          </View>

          {/* LOGIN CARD */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.cardHeader}>
              <Typography variant="h2" style={styles.welcomeText}>Chào mừng trở lại</Typography>
              <Typography variant="caption" color="secondary">Đăng nhập bằng tài khoản sinh viên</Typography>
            </View>

            <View style={styles.form}>
              <TextInput
                label="EMAIL"
                leftIcon="mail-outline"
                value={email}
                onChangeText={(v) => { setEmail(v); setFieldErrors(p => ({ ...p, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldErrors.email}
              />

              <TextInput
                label="MẬT KHẨU"
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                value={password}
                onChangeText={(v) => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
                secureTextEntry={!showPassword}
                error={fieldErrors.password}
              />

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() =>
                  router.push({
                    pathname: '/(auth)/otp',
                    params: email.trim() ? { email: email.trim() } : undefined,
                  })
                }>
                <Typography variant="label" weight="700" color="primary">Quên mật khẩu?</Typography>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={DESIGN.colors.error} />
                <Typography variant="caption" style={styles.errorText}>{error}</Typography>
              </View>
            )}

            <CustomButton
              label="Đăng nhập"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              onPress={handleLogin}
              style={styles.loginBtn}
            />

            <View style={styles.registerRow}>
              <Typography variant="body" color="secondary">Chưa có tài khoản?</Typography>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity style={styles.touchTarget}>
                  <Typography variant="body" weight="700" color="primary"> Đăng ký ngay</Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>

          {/* SOCIAL SECTION */}
          <View style={styles.socialSection}>
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Typography variant="caption" color="secondary" style={styles.dividerText}>HOẶC</Typography>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <SocialButton icon="logo-google" label="Google" color="#EA4335" />
              <SocialButton icon="logo-github" label="GitHub" color="#181717" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * 🧩 REUSABLE SUB-COMPONENTS (Clean Code Pattern)
 */
const SocialButton = ({ icon, label, color }: { icon: any, label: string, color: string }) => (
  <TouchableOpacity style={styles.socialBtn}>
    <Ionicons name={icon} size={20} color={color} />
    <Typography variant="label" weight="600">{label}</Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DESIGN.spacing.container,
    paddingBottom: 40,
    paddingTop: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: DESIGN.spacing.xl,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: DESIGN.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -1,
  },
  card: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.card,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  form: {
    gap: DESIGN.spacing.gap,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingVertical: 8,
  },
  loginBtn: {
    marginTop: 24,
    height: 56,
    borderRadius: DESIGN.radius.button,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    color: DESIGN.colors.error,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  touchTarget: {
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  socialSection: {
    marginTop: 32,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: DESIGN.colors.border,
  },
  dividerText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: DESIGN.radius.button,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    backgroundColor: DESIGN.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
