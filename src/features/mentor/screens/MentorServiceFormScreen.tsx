import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomButton } from '@/src/components/button/CustomButton';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { TextInput } from '@/src/components/form/TextInput';
import { ErrorState } from '@/src/components/states/ErrorState';
import { LoadingState } from '@/src/components/states/LoadingState';
import { Typography } from '@/src/components/typography/Typography';
import { MentorPackage } from '@/src/core/types';
import { theme } from '@/src/theme/theme';

import { MentorServiceFormInput, mentorService } from '../services/mentorService';

function buildFormState(service?: MentorPackage): MentorServiceFormInput {
  const defaultVersion = service?.versions.find((version) => version.isDefault) ?? service?.versions[0];

  return {
    id: service?.id,
    name: service?.title ?? '',
    description: service?.description ?? '',
    isActive: service?.isActive ?? true,
    versions: [
      {
        id: defaultVersion?.id,
        price: defaultVersion?.price ?? 0,
        duration: defaultVersion?.duration ?? 60,
        deliveryType: defaultVersion?.deliveryType ?? 'ONLINE',
        isDefault: true,
        curriculums:
          defaultVersion?.curriculums.length
            ? defaultVersion.curriculums.map((item, index) => ({
                title: item.title,
                description: item.description,
                orderIndex: index + 1,
                duration: item.duration,
              }))
            : [{ title: '', description: '', orderIndex: 1, duration: 0 }],
      },
    ],
  };
}

function MentorServiceFormContent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<MentorServiceFormInput>(buildFormState());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadService = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const service = await mentorService.getMyServiceById(id);
        if (active) {
          setForm(buildFormState(service));
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Không thể tải thông tin gói dịch vụ.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadService();

    return () => {
      active = false;
    };
  }, [id]);

  const version = useMemo(() => form.versions[0], [form.versions]);

  const updateCurriculum = (
    index: number,
    field: 'title' | 'description' | 'duration',
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      versions: [
        {
          ...prev.versions[0],
          curriculums: prev.versions[0].curriculums.map((item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: field === 'duration' ? Number(value || 0) : value,
                }
              : item
          ),
        },
      ],
    }));
  };

  const addCurriculum = () => {
    setForm((prev) => ({
      ...prev,
      versions: [
        {
          ...prev.versions[0],
          curriculums: [
            ...prev.versions[0].curriculums,
            {
              title: '',
              description: '',
              duration: 0,
              orderIndex: prev.versions[0].curriculums.length + 1,
            },
          ],
        },
      ],
    }));
  };

  const removeCurriculum = (index: number) => {
    setForm((prev) => {
      const nextCurriculums = prev.versions[0].curriculums
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          orderIndex: itemIndex + 1,
        }));

      return {
        ...prev,
        versions: [
          {
            ...prev.versions[0],
            curriculums:
              nextCurriculums.length > 0
                ? nextCurriculums
                : [{ title: '', description: '', duration: 0, orderIndex: 1 }],
          },
        ],
      };
    });
  };

  const handleSubmit = async () => {
    const normalizedCurriculums = version.curriculums.map((item, index) => ({
      ...item,
      orderIndex: index + 1,
      duration: Number(item.duration || 0),
    }));

    if (!form.name.trim()) {
      setSubmitError('Tên gói dịch vụ không được để trống.');
      return;
    }

    if (Number(version.price) <= 0) {
      setSubmitError('Giá gói dịch vụ phải lớn hơn 0.');
      return;
    }

    if (Number(version.duration) <= 0) {
      setSubmitError('Thời lượng phải lớn hơn 0.');
      return;
    }

    if (normalizedCurriculums.some((item) => !item.title.trim())) {
      setSubmitError('Mỗi buổi học trong lộ trình đều cần có tiêu đề.');
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      await mentorService.saveService({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() ?? '',
        versions: [
          {
            ...version,
            price: Number(version.price),
            duration: Number(version.duration),
            curriculums: normalizedCurriculums,
          },
        ],
      });
      router.replace('/mentor/services' as any);
    } catch (err: any) {
      setSubmitError(err.message || 'Không thể lưu gói dịch vụ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải gói dịch vụ..." />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => router.replace(`/mentor/services/form?id=${id}` as any)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Typography variant="bodyMedium" style={styles.headerTitle}>
            {isEditing ? 'Sửa gói dịch vụ' : 'Tạo gói dịch vụ'}
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <TextInput
            label="TÊN GÓI DỊCH VỤ"
            placeholder="Ví dụ: Mock Interview React Native"
            value={form.name}
            onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />

          <TextInput
            label="MÔ TẢ"
            placeholder="Mô tả ngắn về nội dung và lợi ích của gói học"
            value={form.description}
            onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
            isTextArea
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <TextInput
                label="GIÁ"
                placeholder="50"
                value={String(version.price || '')}
                onChangeText={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    versions: [{ ...prev.versions[0], price: Number(value || 0) }],
                  }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfCol}>
              <TextInput
                label="THỜI LƯỢNG"
                placeholder="60"
                value={String(version.duration || '')}
                onChangeText={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    versions: [{ ...prev.versions[0], duration: Number(value || 0) }],
                  }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Lộ trình buổi học
            </Typography>
            <TouchableOpacity onPress={addCurriculum} activeOpacity={0.7}>
              <Typography variant="bodyMedium" style={styles.addText}>
                Thêm buổi
              </Typography>
            </TouchableOpacity>
          </View>

          {version.curriculums.map((item, index) => (
            <View key={`${index}-${item.orderIndex}`} style={styles.curriculumCard}>
              <View style={styles.curriculumHeader}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                  Buổi {index + 1}
                </Typography>
                <TouchableOpacity onPress={() => removeCurriculum(index)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>

              <TextInput
                label="TIÊU ĐỀ"
                placeholder="Nhập tiêu đề buổi học"
                value={item.title}
                onChangeText={(value) => updateCurriculum(index, 'title', value)}
              />

              <TextInput
                label="MÔ TẢ"
                placeholder="Nội dung chính của buổi học"
                value={item.description}
                onChangeText={(value) => updateCurriculum(index, 'description', value)}
                isTextArea
              />

              <TextInput
                label="THỜI LƯỢNG BUỔI HỌC"
                placeholder="30"
                value={String(item.duration || '')}
                onChangeText={(value) => updateCurriculum(index, 'duration', value)}
                keyboardType="numeric"
              />
            </View>
          ))}

          {submitError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
              <Typography variant="label" style={styles.errorText}>
                {submitError}
              </Typography>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            label={isEditing ? 'Lưu thay đổi' : 'Tạo gói dịch vụ'}
            loading={saving}
            disabled={saving}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function MentorServiceFormScreen() {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <MentorServiceFormContent />
    </ProtectedRoute>
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
    backgroundColor: theme.colors.surface,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  scroll: {
    padding: 20,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  addText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  curriculumCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    padding: 16,
    marginBottom: 16,
  },
  curriculumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
    fontWeight: '700',
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
});
