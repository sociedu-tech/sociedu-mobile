import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../src/components/typography/Typography';
import { CustomButton } from '../../src/components/button/CustomButton';
import { LoadingState } from '../../src/components/states/LoadingState';
import { ErrorState } from '../../src/components/states/ErrorState';
import { theme } from '../../src/theme/theme';

import { mentorService } from '../../src/core/services/mentorService';
import { orderService } from '../../src/core/services/orderService';
import { User, MentorPackage, MentorPackageVersion } from '../../src/core/types';

// Xử lý deeplink redirect từ VNPay (nếu cấu hình scheme trong app.json)
WebBrowser.maybeCompleteAuthSession();

export default function MentorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [mentor, setMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchMentor();
  }, [id]);

  const fetchMentor = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) throw new Error('Missing Mentor ID');
      const data = await mentorService.getProfile(id);
      setMentor(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết Mentor.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Đang tải dữ liệu Mentor..." />;
  if (error || !mentor) return <ErrorState error={error || 'Profile not found'} onRetry={fetchMentor} />;

  const info = mentor.mentorInfo;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Chi tiết</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Mentor Info */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder} />
          <Typography variant="h2" style={styles.name}>{mentor.name}</Typography>
          <Typography variant="body" color="secondary" style={styles.headline}>
            {info?.headline || 'Chuyên gia'}
          </Typography>
          {info?.verificationStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
              <Typography variant="caption" style={{ color: '#FFF', fontWeight: '700', marginLeft: 4 }}>
                Đã xác thực
              </Typography>
            </View>
          )}
        </View>

        <Typography variant="body" style={styles.bio}>
          {mentor.bio || 'Chưa có thông tin giới thiệu.'}
        </Typography>

        <View style={styles.divider} />

        {/* Packages Area */}
        <Typography variant="h3" style={{ marginBottom: 12 }}>Các gói dịch vụ</Typography>
        
        {info?.packages?.length === 0 ? (
          <Typography variant="bodyMedium" color="secondary">Mentor chưa cung cấp gói dịch vụ nào.</Typography>
        ) : (
          info?.packages?.map(pkg => (
            <TouchableOpacity 
              key={pkg.id} 
              style={styles.packageCard}
              onPress={() => router.push({
                pathname: "/package/[id]",
                params: { id: pkg.id, mentorId: id }
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                   <Typography variant="bodyMedium" style={styles.pkgTitle}>{pkg.title}</Typography>
                   <Typography variant="caption" color="secondary" numberOfLines={2}>{pkg.description}</Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.border.default} />
              </View>
              
              <View style={styles.pkgFooter}>
                 <Typography variant="caption" color="secondary">Bắt đầu từ</Typography>
                 <Typography variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                   ${pkg.versions[0]?.price || 0}
                 </Typography>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.border.default,
    marginBottom: 12,
  },
  name: {
    fontWeight: '800',
    marginBottom: 4,
  },
  headline: {
    textAlign: 'center',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  bio: {
    lineHeight: 22,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.default,
    marginVertical: 24,
  },
  packageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    marginBottom: 16,
  },
  pkgTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  pkgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  }
});
