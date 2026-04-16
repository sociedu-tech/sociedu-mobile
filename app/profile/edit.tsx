import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Typography } from '../../src/components/typography/Typography';
import { TextInput } from '../../src/components/form/TextInput';
import { CustomButton } from '../../src/components/button/CustomButton';
import { theme } from '../../src/theme/theme';
import { scaleFont } from '../../src/theme/responsiveUtils';
import { userService } from '../../src/core/services/userService';
import { useAuthStore } from '../../src/core/store/authStore';
import { User } from '../../src/core/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const updateStoreUser = useAuthStore((s) => s.login); // Re-use login to update local state fully if needed
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const data = await userService.getMe();
      setFirstName(data.name.split(' ').slice(0, -1).join(' ') || '');
      setLastName(data.name.split(' ').slice(-1).join(' ') || data.name);
      // Giả lập lấy thêm details nếu model User hỗ trợ
      // Nếu API thật trả về rỗng, gán chuỗi rỗng
      setAvatarUri(data.avatar || null);
    } catch (e) {
      console.log('Error loading profile', e);
    } finally {
      setFetching(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Cấp quyền', 'Bạn cần cấp quyền truy cập ảnh để đổi Avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    setLoading(true);
    try {
      await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Nếu có API up ảnh, gọi ở đây. 

      Alert.alert('Thành công', 'Đã cập nhật hồ sơ.', [
        { text: 'Xong', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Lấy Initials Text ───
  const getInitials = () => {
    const f = firstName.charAt(0).toUpperCase();
    const l = lastName.charAt(0).toUpperCase();
    return `${f}${l}` || 'U';
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Typography variant="bodyMedium" color="secondary">Đang tải...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ═════════ HEADER ═════════ */}
        <View style={styles.header}>
          <Typography variant="h2" style={styles.headerTitle}>Chỉnh sửa hồ sơ</Typography>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
             <Typography variant="bodyMedium" color="secondary">Hủy</Typography>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>

          {/* ═════════ AVATAR SECTION ═════════ */}
          <View style={styles.avatarSection}>
             {/* Text-based Avatar Box thay vì Icon */}
             <View style={styles.avatarBox}>
               {avatarUri ? (
                 <View style={styles.avatarBoxInner} />
                 // Tích hợp Image thật: <Image source={{uri: avatarUri}} style={styles.avatarBoxInner} />
                 // Do policy KHÔNG sử dụng ICON (kể cả back button), form tập trung thuần text.
               ) : (
                 <Typography variant="h1" style={styles.avatarInitials}>{getInitials()}</Typography>
               )}
             </View>
             
             <TouchableOpacity onPress={handlePickImage} style={styles.avatarChangeBtn}>
                <Typography variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                   Thay đổi ảnh
                </Typography>
             </TouchableOpacity>
          </View>

          {/* ═════════ FORM SECTION ═════════ */}
          <View style={styles.formSection}>
            <Typography variant="bodyMedium" style={styles.sectionHeader}>THÔNG TIN CƠ BẢN</Typography>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <TextInput
                  label="HỌ VÀ TÊN ĐỆM"
                  placeholder="VD: Nguyễn Văn"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: 8 }}>
                <TextInput
                  label="TÊN"
                  placeholder="VD: Nam"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <TextInput
              label="CHỨC DANH (HEADLINE)"
              placeholder="VD: Sinh viên năm 4 / Kỹ sư phần mềm"
              value={headline}
              onChangeText={setHeadline}
            />

            <TextInput
              label="TIỂU SỬ"
              placeholder="Viết một vài dòng giới thiệu bản thân..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </View>

        </ScrollView>

        {/* ═════════ ACTIONS ═════════ */}
        <View style={styles.footer}>
          <CustomButton 
            label="Lưu thay đổi"
            size="lg"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontSize: Math.min(scaleFont(22), 22),
    textAlign: 'center',
    marginTop: -4,
  },
  headerBackBtn: {
    position: 'absolute',
    left: 24,
    paddingVertical: 8,
  },

  // ── Scroll & Content ──
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBoxInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitials: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: Math.min(scaleFont(28), 28),
    textAlign: 'center',
  },
  avatarChangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primaryLight + '30',
    borderRadius: 16,
  },

  // ── Form ──
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontWeight: '700',
    letterSpacing: 0.5,
    color: theme.colors.text.secondary,
    marginBottom: 16,
    fontSize: Math.min(scaleFont(15), 15),
    textAlign: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
  },

  // ── Footer ──
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  }
});
