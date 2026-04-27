import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { TEXT } from '@/src/core/constants/strings';
import { theme } from '@/src/theme/theme';

import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const C = {
  dark: '#222222',
  gray: '#717171',
  blue: theme.colors.primary,
  bg: '#F3F2EF',
  surface: '#FFFFFF',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  error: '#DC2626',
  divider: '#E5E7EB',
  socialBorder: '#E5E7EB',
  google: '#EA4335',
};

export default function LoginScreen() {
  const router = useRouter();
  const storeLogin = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [formOpacity, formSlide, logoScale]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(TEXT.AUTH.LOGIN_EMPTY);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await authService.login({ email: email.trim(), password });
      storeLogin(user);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.branding, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoBox}>
              <Ionicons name="school-outline" size={28} color={C.dark} />
            </View>
            <Typography variant="h1" style={styles.brandName}>
              UniShare
            </Typography>
            <Typography variant="caption" style={styles.brandTagline}>
              {TEXT.AUTH.APP_TAGLINE}
            </Typography>
          </Animated.View>

          <Animated.View
            style={[
              styles.formCard,
              { opacity: formOpacity, transform: [{ translateY: formSlide }] },
            ]}
          >
            <View style={styles.heading}>
              <Typography variant="h2" style={styles.welcomeTitle}>
                {TEXT.AUTH.LOGIN_TITLE}
              </Typography>
              <Typography variant="body" color="secondary">
                {TEXT.AUTH.LOGIN_SUBTITLE}
              </Typography>
            </View>

            <TextInput
              label="EMAIL SINH VIÊN"
              placeholder="name@university.edu.vn"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />

            <TextInput
              label="MẬT KHẨU"
              placeholder="********"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Typography variant="label" style={styles.forgotText}>
                {TEXT.AUTH.FORGOT_PASSWORD}
              </Typography>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={C.error} />
                <Typography variant="label" style={styles.errorText}>
                  {error}
                </Typography>
              </View>
            ) : null}

            <CustomButton
              label={TEXT.AUTH.LOGIN_CTA}
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              icon={!loading ? <Ionicons name="arrow-forward" size={18} color="#FFF" /> : undefined}
              onPress={handleLogin}
              style={styles.loginBtn}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Typography variant="caption" style={styles.dividerText}>
                HOẶC TIẾP TỤC VỚI
              </Typography>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color={C.google} />
                <Typography variant="label" style={styles.socialBtnText}>
                  Google
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-github" size={20} color={C.dark} />
                <Typography variant="label" style={styles.socialBtnText}>
                  GitHub
                </Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.registerRow}>
              <Typography variant="body" color="secondary">
                {TEXT.AUTH.NO_ACCOUNT}
              </Typography>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Typography variant="bodyMedium" weight="700" style={styles.registerLink}>
                    {' '}
                    {TEXT.AUTH.REGISTER_LINK}
                  </Typography>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    justifyContent: 'center',
  },
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
  heading: {
    marginBottom: 24,
  },
  welcomeTitle: {
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -12,
    marginBottom: 4,
  },
  forgotText: {
    color: C.blue,
    fontWeight: '700',
  },
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
  loginBtn: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLink: {
    color: C.blue,
  },
});
