import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../../../../src/components/typography/Typography';
import { CustomButton } from '../../../../../src/components/button/CustomButton';
import { TextInput } from '../../../../../src/components/form/TextInput';
import { TEXT } from '../../../../../src/core/constants/strings';
import { mentorService } from '../../../../../src/core/services/mentorService';
import { CreatePackageVersionRequest, CurriculumItem, MentorPackageVersion } from '../../../../../src/core/types';
import { theme } from '../../../../../src/theme/theme';

type CurriculumDraft = {
  id?: string;
  title: string;
  description: string;
  duration: string;
};

export default function PackageVersionEditorScreen() {
  const router = useRouter();
  const { packageId, versionId } = useLocalSearchParams<{ packageId: string; versionId: string }>();
  const isEditing = versionId !== 'new';

  const [fetching, setFetching] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [versionMeta, setVersionMeta] = useState<MentorPackageVersion | null>(null);
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [deliveryType, setDeliveryType] = useState('ONLINE');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [curriculums, setCurriculums] = useState<CurriculumDraft[]>([
    { title: '', description: '', duration: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hydrateForm = (version: MentorPackageVersion) => {
    setVersionMeta(version);
    setPrice(String(version.price));
    setDuration(String(version.duration));
    setDeliveryType(version.deliveryType);
    setIsDefault(version.isDefault);
    setIsActive(version.isActive ?? true);
    setCurriculums(
      version.curriculums.length > 0
        ? version.curriculums.map((item: CurriculumItem) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            duration: String(item.duration || ''),
          }))
        : [{ title: '', description: '', duration: '' }],
    );
  };

  const loadVersion = useCallback(async () => {
    setFetching(true);
    try {
      const version = await mentorService.getPackageVersionById(packageId, versionId);
      hydrateForm(version);
    } catch (error: any) {
      setErrors({ submit: error?.message || TEXT.SERVICE_VERSION.VERSION_LOADING });
    } finally {
      setFetching(false);
    }
  }, [packageId, versionId]);

  useEffect(() => {
    if (!isEditing) return;
    void loadVersion();
  }, [isEditing, loadVersion]);

  const addCurriculum = () => {
    setCurriculums((prev) => [...prev, { title: '', description: '', duration: '' }]);
  };

  const removeCurriculum = (index: number) => {
    if (curriculums.length <= 1) {
      setErrors((prev) => ({ ...prev, curriculum_general: TEXT.CURRICULUM.MIN_REQUIRED }));
      return;
    }
    setCurriculums((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveCurriculum = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= curriculums.length) return;
    setCurriculums((prev) => {
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const updateCurriculum = (index: number, field: keyof CurriculumDraft, value: string) => {
    setCurriculums((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors((prev) => ({
      ...prev,
      [`curriculum_${index}_title`]: '',
      [`curriculum_${index}_duration`]: '',
      curriculum_general: '',
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!isEditing) {
      if (!price.trim() || Number.isNaN(Number(price)) || Number(price) <= 0) {
        nextErrors.price = TEXT.SERVICE_VERSION.VALIDATION_PRICE;
      }
      if (!duration.trim() || Number.isNaN(Number(duration)) || Number(duration) <= 0) {
        nextErrors.duration = TEXT.SERVICE_VERSION.VALIDATION_DURATION;
      }
    }
    if (curriculums.length === 0) {
      nextErrors.curriculum_general = TEXT.CURRICULUM.MIN_REQUIRED;
    }
    curriculums.forEach((item, index) => {
      if (!item.title.trim()) {
        nextErrors[`curriculum_${index}_title`] = TEXT.CURRICULUM.TITLE_REQUIRED;
      }
      if (!item.duration.trim() || Number.isNaN(Number(item.duration)) || Number(item.duration) <= 0) {
        nextErrors[`curriculum_${index}_duration`] = TEXT.SERVICE_VERSION.VALIDATION_DURATION;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing) {
        const existingById = new Map(
          (versionMeta?.curriculums ?? [])
            .filter((item) => item.id)
            .map((item) => [String(item.id), item]),
        );
        const currentIds = new Set(curriculums.filter((item) => item.id).map((item) => String(item.id)));

        await Promise.all(
          curriculums.map((item, index) => {
            const payload = {
              title: item.title.trim(),
              description: item.description.trim(),
              orderIndex: index + 1,
              duration: Number(item.duration),
            };

            if (item.id && existingById.has(String(item.id))) {
              return mentorService.updateCurriculumItem(packageId, versionId, item.id, payload);
            }

            return mentorService.addCurriculumItem(packageId, versionId, payload);
          }),
        );

        const removedCurriculums = (versionMeta?.curriculums ?? []).filter(
          (item) => !currentIds.has(String(item.id)),
        );
        await Promise.all(
          removedCurriculums.map((item) =>
            mentorService.deleteCurriculumItem(packageId, versionId, item.id),
          ),
        );

        Alert.alert(TEXT.COMMON.SUCCESS, TEXT.SERVICE_VERSION.VERSION_SAVE_SUCCESS);
      } else {
        const payload: CreatePackageVersionRequest = {
          price: Number(price),
          duration: Number(duration),
          deliveryType,
          isDefault,
          isActive,
          curriculums: curriculums.map((item, index) => ({
            title: item.title.trim(),
            description: item.description.trim(),
            orderIndex: index + 1,
            duration: Number(item.duration),
          })),
        };
        const savedVersion = await mentorService.createPackageVersion(packageId, payload);
        Alert.alert(
          TEXT.COMMON.SUCCESS,
          TEXT.SERVICE_VERSION.VERSION_CREATE_SUCCESS.replace('{id}', String(savedVersion.id)),
        );
      }
      router.replace(`/mentor/services/${packageId}/versions` as any);
    } catch (error: any) {
      setErrors({ submit: error?.message || TEXT.SERVICE_VERSION.VERSION_SAVE_ERROR });
    } finally {
      setLoading(false);
    }
  };

  const canEditMetadata = !isEditing;
  const helperText = isEditing
    ? 'Backend hiện cho phép quản lý giáo trình của phiên bản hiện có. Giá, thời lượng, trạng thái mặc định và trạng thái hoạt động đang ở chế độ chỉ đọc.'
    : TEXT.SERVICE_VERSION.VERSION_STATUS_EDITABLE;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Typography variant="bodyMedium" style={styles.headerTitle}>
                {isEditing ? TEXT.SERVICE_VERSION.VERSION_EDITOR_EDIT_TITLE : TEXT.SERVICE_VERSION.VERSION_EDITOR_ADD_TITLE}
              </Typography>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
              {fetching ? (
                <Typography variant="body" color="secondary">
                  {TEXT.SERVICE_VERSION.VERSION_LOADING}
                </Typography>
              ) : (
                <>
                  <View style={styles.warningCard}>
                    <Typography variant="bodyMedium" style={styles.warningTitle}>
                      {TEXT.SERVICE_VERSION.VERSION_STATUS_TITLE}
                    </Typography>
                    <Typography variant="body" color="secondary">
                      {helperText}
                    </Typography>
                  </View>

                  <View style={styles.section}>
                    <Typography variant="bodyMedium" style={styles.sectionTitle}>
                      {TEXT.SERVICE_VERSION.VERSION_INFO_TITLE}
                    </Typography>
                    <View style={styles.row}>
                      <View style={styles.half}>
                        <TextInput
                          label={TEXT.SERVICE_VERSION.PRICE_LABEL}
                          placeholder="300000"
                          keyboardType="numeric"
                          value={price}
                          onChangeText={(value: string) => setPrice(value)}
                          error={errors.price}
                          editable={canEditMetadata}
                        />
                      </View>
                      <View style={styles.half}>
                        <TextInput
                          label={TEXT.SERVICE_VERSION.DURATION_LABEL}
                          placeholder="60"
                          keyboardType="numeric"
                          value={duration}
                          onChangeText={(value: string) => setDuration(value)}
                          error={errors.duration}
                          editable={canEditMetadata}
                        />
                      </View>
                    </View>

                    <TextInput
                      label={TEXT.SERVICE_VERSION.DELIVERY_TYPE_LABEL}
                      placeholder={TEXT.SERVICE_VERSION.DELIVERY_TYPE_PLACEHOLDER}
                      value={deliveryType}
                      onChangeText={(value: string) => setDeliveryType(value)}
                      helperText={TEXT.SERVICE_VERSION.DELIVERY_TYPE_HELPER}
                      editable={canEditMetadata}
                    />

                    <View style={styles.toggleRow}>
                      <View style={styles.toggleCard}>
                        <View>
                          <Typography variant="bodyMedium" style={styles.toggleTitle}>
                            {TEXT.SERVICE_VERSION.DEFAULT_TOGGLE_TITLE}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {TEXT.SERVICE_VERSION.DEFAULT_TOGGLE_DESC}
                          </Typography>
                        </View>
                        <Ionicons
                          name={isDefault ? 'checkmark-circle' : 'ellipse-outline'}
                          size={24}
                          color={isDefault ? theme.colors.primary : theme.colors.text.disabled}
                        />
                      </View>

                      <View style={styles.toggleCard}>
                        <View>
                          <Typography variant="bodyMedium" style={styles.toggleTitle}>
                            {TEXT.SERVICE_VERSION.ACTIVE_TOGGLE_TITLE}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {TEXT.SERVICE_VERSION.ACTIVE_TOGGLE_DESC}
                          </Typography>
                        </View>
                        <Ionicons
                          name={isActive ? 'checkmark-circle' : 'close-circle-outline'}
                          size={24}
                          color={isActive ? theme.colors.success : theme.colors.text.disabled}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <View style={styles.curriculumHeader}>
                      <Typography variant="bodyMedium" style={styles.sectionTitle}>
                        {TEXT.CURRICULUM.TITLE}
                      </Typography>
                      <TouchableOpacity onPress={addCurriculum}>
                        <Typography variant="label" style={styles.addLink}>
                          {TEXT.CURRICULUM.ADD_ITEM}
                        </Typography>
                      </TouchableOpacity>
                    </View>

                    {errors.curriculum_general ? (
                      <Typography variant="caption" color="error" style={{ marginBottom: 12 }}>
                        {errors.curriculum_general}
                      </Typography>
                    ) : null}

                    {curriculums.map((item, index) => (
                      <View key={`${item.id ?? 'new'}-${index}`} style={styles.curriculumCard}>
                        <View style={styles.curriculumCardHeader}>
                          <Typography variant="label" style={styles.curriculumTitle}>
                            {TEXT.CURRICULUM.ITEM_LABEL.replace('{index}', String(index + 1))}
                          </Typography>
                          <View style={styles.curriculumActions}>
                            <TouchableOpacity onPress={() => moveCurriculum(index, -1)} style={styles.iconBtn}>
                              <Ionicons name="arrow-up" size={18} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => moveCurriculum(index, 1)} style={styles.iconBtn}>
                              <Ionicons name="arrow-down" size={18} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeCurriculum(index)} style={styles.iconBtn}>
                              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TextInput
                          label={TEXT.CURRICULUM.TITLE_LABEL}
                          placeholder={TEXT.CURRICULUM.TITLE_PLACEHOLDER}
                          value={item.title}
                          onChangeText={(value) => updateCurriculum(index, 'title', value)}
                          error={errors[`curriculum_${index}_title`]}
                        />
                        <TextInput
                          label={TEXT.CURRICULUM.DESCRIPTION_LABEL}
                          placeholder={TEXT.CURRICULUM.DESCRIPTION_PLACEHOLDER}
                          value={item.description}
                          onChangeText={(value) => updateCurriculum(index, 'description', value)}
                          multiline
                          numberOfLines={3}
                        />
                        <TextInput
                          label={TEXT.CURRICULUM.DURATION_LABEL}
                          placeholder={TEXT.CURRICULUM.DURATION_PLACEHOLDER}
                          keyboardType="numeric"
                          value={item.duration}
                          onChangeText={(value) => updateCurriculum(index, 'duration', value)}
                          error={errors[`curriculum_${index}_duration`]}
                        />
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.footer}>
              {errors.submit ? (
                <Typography variant="caption" color="error" style={styles.submitError}>
                  {errors.submit}
                </Typography>
              ) : null}
              <CustomButton
                label={isEditing ? 'Lưu thay đổi giáo trình' : TEXT.SERVICE_VERSION.CREATE_VERSION}
                onPress={handleSave}
                loading={loading}
                disabled={fetching}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 120 },
  warningCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 16,
  },
  warningTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: theme.colors.warning,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
    marginHorizontal: 4,
  },
  toggleRow: {
    marginTop: 8,
  },
  toggleCard: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addLink: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  curriculumCard: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: theme.colors.background,
  },
  curriculumCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  curriculumTitle: {
    fontWeight: '700',
  },
  curriculumActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  submitError: {
    marginBottom: 8,
    textAlign: 'center',
  },
});
