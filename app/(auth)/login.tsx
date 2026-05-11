import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { useAuthStore } from '../../src/core/store/authStore';
import { authService } from '../../src/core/services/authService';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError(null);
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Vui lòng nhập email.';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu.';
    
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

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
    <View style={{ flex: 1, backgroundColor: theme.colors.primary }}>
      <LinearGradient
        colors={[theme.colors.primary, '#7C3AED']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* BRANDING */}
            <Animated.View style={[styles.branding, { opacity: fadeAnim }]}>
              <View style={styles.logoCircle}>
                <Ionicons name="flash" size={40} color={theme.colors.primary} />
              </View>
              <Typography variant="h1" style={{ color: '#FFF', fontWeight: '900', fontSize: 36, paddingTop: 4 }}>UniShare</Typography>
              <Typography variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>Kiến tạo tương lai trí tuệ</Typography>
            </Animated.View>

            {/* LOGIN CARD */}
            <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Typography variant="h2" style={styles.welcomeTitle}>Chào mừng trở lại</Typography>
              <Typography variant="caption" color="muted" style={{ marginBottom: 24 }}>Đăng nhập để tiếp tục hành trình học tập</Typography>

              <View style={styles.form}>
                <TextInput
                  label="EMAIL"
                  placeholder="name@university.edu"
                  leftIcon="mail"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setFieldErrors(p => ({ ...p, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={fieldErrors.email}
                />

                <TextInput
                  label="MẬT KHẨU"
                  placeholder="••••••••"
                  leftIcon="lock-closed"
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  error={fieldErrors.password}
                />

                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push({ pathname: '/(auth)/otp', params: { email: email.trim() } as any })}>
                  <Typography variant="label" color="primary">Quên mật khẩu?</Typography>
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                  <Typography variant="caption" style={{ color: theme.colors.error, fontWeight: '700' }}>{error}</Typography>
                </View>
              )}

              <CustomButton
                label="Đăng nhập"
                variant="gradient"
                size="lg"
                loading={loading}
                onPress={handleLogin}
                style={styles.loginBtn}
              />

              <View style={styles.footerRow}>
                <Typography variant="body" color="secondary">Chưa có tài khoản?</Typography>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Typography variant="body" style={{ fontWeight: '800', color: theme.colors.primary }}> Đăng ký ngay</Typography>
                  </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 60,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80, height: 80,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.premium,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 28,
    ...theme.shadows.medium,
  },
  welcomeTitle: {
    fontWeight: '900',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  form: {
    gap: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  loginBtn: {
    marginTop: 24,
    borderRadius: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
});
