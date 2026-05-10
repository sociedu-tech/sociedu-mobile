import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, '#4338CA', '#1E1B4B']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* DECORATION */}
          <View style={styles.iconCircle}>
            <Ionicons name="rocket-sharp" size={48} color="#FFF" />
          </View>

          <View style={styles.textContainer}>
            <Typography variant="h1" style={styles.title}>
              UniShare
            </Typography>
            <View style={styles.badge}>
              <Typography variant="caption" style={styles.badgeText}>SINH VIÊN VIỆT NAM</Typography>
            </View>
            <Typography variant="body" style={styles.description}>
              Nền tảng kết nối tri thức, chia sẻ kinh nghiệm và đồng hành cùng Mentor hàng đầu.
            </Typography>
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton 
            label="Bắt đầu ngay" 
            variant="gradient"
            size="lg"
            onPress={() => router.push('/(auth)/login')} 
            style={styles.mainBtn} 
          />
          <CustomButton 
            label="Khám phá cộng đồng" 
            variant="outline" 
            size="lg"
            onPress={() => router.push('/(auth)/register')} 
            style={styles.outlineBtn}
          />
          <Typography variant="caption" style={styles.copyright}>
            Version 1.2.0 • © 2026 UniShare Team
          </Typography>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100, height: 100,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  badge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 17,
  },
  footer: {
    paddingBottom: 40,
  },
  mainBtn: {
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  outlineBtn: {
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
  },
  copyright: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 24,
  }
});
