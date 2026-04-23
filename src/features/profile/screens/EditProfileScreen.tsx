import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '@/src/components/button/CustomButton';
import { TextInput } from '@/src/components/form/TextInput';
import { Typography } from '@/src/components/typography/Typography';
import { scaleFont } from '@/src/theme/responsiveUtils';
import { theme } from '@/src/theme/theme';

import { userService } from '../services/userService';

export default function EditProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setFetching(true);
      try {
        const data = await userService.getMe();
        setFirstName(data.name.split(' ').slice(0, -1).join(' ') || '');
        setLastName(data.name.split(' ').slice(-1).join(' ') || data.name);
        setHeadline(data.headline || '');
        setBio(data.bio || '');
        setAvatarUri(data.avatar || null);
      } catch (error) {
        console.log('Error loading profile', error);
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cấp quyền', 'Bạn cần cấp quyền truy cập ảnh để đổi avatar.');
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
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã cập nhật hồ sơ.', [
        { text: 'Xong', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Chỉnh sửa hồ sơ</Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarBox}>
              {avatarUri ? (
                <View style={styles.avatarBoxInner} />
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

          <View style={styles.formSection}>
            <Typography variant="bodyMedium" style={styles.sectionHeader}>THÔNG TIN CƠ BẢN</Typography>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <TextInput
                  label="HỌ VÀ TÊN ĐỆM"
                  placeholder="VD: Nguyễn Văn"
                  leftIcon="person-outline"
                  value={firstName}
                  onChangeText={setFirstName}
                  helperText="Tên đệm lót"
                />
              </View>
              <View style={{ flex: 1, paddingLeft: 8 }}>
                <TextInput
                  label="TÊN"
                  placeholder="VD: Nam"
                  leftIcon="person"
                  value={lastName}
                  onChangeText={setLastName}
                  helperText="Tên chính"
                />
              </View>
            </View>

            <TextInput
              label="CHỨC DANH (HEADLINE)"
              placeholder="VD: Sinh viên năm 4 / Kỹ sư phần mềm"
              leftIcon="briefcase-outline"
              value={headline}
              onChangeText={setHeadline}
              helperText="Công việc hoặc chuyên môn hiện tại"
            />

            <TextInput
              label="TIỂU SỬ"
              placeholder="Viết một vài dòng giới thiệu bản thân..."
              leftIcon="document-text-outline"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              isTextArea
              helperText="Kể ngắn gọn về kinh nghiệm của bạn"
            />
          </View>
        </ScrollView>

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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  scroll: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 60,
  },
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
    backgroundColor: `${theme.colors.primaryLight}30`,
    borderRadius: 16,
  },
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
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface,
  },
});
