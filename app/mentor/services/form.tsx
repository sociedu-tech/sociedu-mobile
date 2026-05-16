import React, { useCallback, useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../../src/components/typography/Typography';
import { CustomButton } from '../../../src/components/button/CustomButton';
import { TextInput } from '../../../src/components/form/TextInput';
import { theme } from '../../../src/theme/theme';
import { TEXT } from '../../../src/core/constants/strings';
import { mentorService } from '../../../src/core/services/mentorService';
import { CreateServiceRequest } from '../../../src/core/types';

type CurriculumDraft = {
  title: string;
  description: string;
  duration: string;
};

export default function MentorServiceFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [versionsCount, setVersionsCount] = useState(0);
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [deliveryType, setDeliveryType] = useState('ONLINE');
  const [curriculums, setCurriculums] = useState<CurriculumDraft[]>([
    { title: '', description: '', duration: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadPackage = useCallback(async () => {
    setFetching(true);
    try {
      const pkg = await mentorService.getPackageById(id!);
      setName(pkg.title);
      setDescription(pkg.description);
      setIsActive(pkg.isActive);
      setVersionsCount(pkg.versions.length);
    } catch (error: any) {
      setErrors({ submit: error?.message || TEXT.COMMON.ERROR });
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void loadPackage();
  }, [id, loadPackage]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = TEXT.SERVICE.VALIDATION.NAME_REQUIRED;
    if (!isEditing) {
      if (!price.trim() || Number.isNaN(Number(price)) || Number(price) < 0) {
        nextErrors.price = TEXT.SERVICE.VALIDATION.PRICE_MIN;
      }
      if (!duration.trim() || Number.isNaN(Number(duration)) || Number(duration) < 1) {
        nextErrors.duration = TEXT.SERVICE_VERSION.VALIDATION_DURATION;
      }
      if (curriculums.length === 0) {
        nextErrors.curriculum_general = TEXT.SERVICE.VALIDATION.CURRICULUM_MIN;
      }
      curriculums.forEach((item, index) => {
        if (!item.title.trim()) {
          nextErrors[`curriculum_${index}_title`] = TEXT.CURRICULUM.TITLE_REQUIRED;
        }
        if (!item.duration.trim() || Number.isNaN(Number(item.duration)) || Number(item.duration) < 1) {
          nextErrors[`curriculum_${index}_duration`] = TEXT.SERVICE_VERSION.VALIDATION_DURATION;
        }
      });
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (isEditing) {
      Alert.alert(
        TEXT.SERVICE.EDIT_WARNING_TITLE,
        TEXT.SERVICE.EDIT_WARNING_MESSAGE,
        [
          {
            text: TEXT.COMMON.CANCEL,
            style: 'cancel',
          },
          {
            text: TEXT.COMMON.CONFIRM,
            onPress: () => {
              void submitForm();
            },
          },
        ],
      );
      return;
    }

    await submitForm();
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        await mentorService.updateService(id!, {
          name: name.trim(),
          description: description.trim(),
        });
        router.push(`/mentor/services/${id}/versions` as any);
      } else {
        const payload: CreateServiceRequest = {
          name: name.trim(),
          description: description.trim(),
          isActive: true,
          price: Number(price),
          duration: Number(duration),
          deliveryType: deliveryType.trim() || 'ONLINE',
          curriculums: curriculums.map((item, index) => ({
            title: item.title.trim(),
            description: item.description.trim(),
            orderIndex: index + 1,
            duration: Number(item.duration),
          })),
        };
        const pkg = await mentorService.createPackage(payload);
        const createdVersion = pkg.versions.find((item) => item.isDefault) ?? pkg.versions[0];

        if (createdVersion?.id) {
          router.replace(`/mentor/services/${pkg.id}/versions/${createdVersion.id}` as any);
        } else {
          router.replace(`/mentor/services/${pkg.id}/versions` as any);
        }
      }
    } catch (error: any) {
      setErrors({ submit: error?.message || TEXT.COMMON.ERROR });
    } finally {
      setLoading(false);
    }
  };

  const addCurriculum = () => {
    setCurriculums((prev) => [...prev, { title: '', description: '', duration: '' }]);
  };

  const removeCurriculum = (index: number) => {
    setCurriculums((prev) => (prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)));
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
          <View style={{ flex: 1 }}>
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Typography variant="bodyMedium" style={styles.headerTitle}>
                {isEditing ? TEXT.SERVICE.FORM_TITLE_EDIT : TEXT.SERVICE.FORM_TITLE_ADD}
              </Typography>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              {fetching ? (
                <Typography variant="body" color="secondary">
                  {TEXT.COMMON.LOADING}
                </Typography>
              ) : (
                <>
                  <View style={styles.section}>
                    <TextInput
                      label={TEXT.SERVICE.NAME_LABEL}
                      placeholder={TEXT.SERVICE.NAME_PLACEHOLDER}
                      value={name}
                      onChangeText={(txt) => {
                        setName(txt);
                        setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      error={errors.name}
                    />

                    <TextInput
                      label={TEXT.SERVICE.DESC_LABEL}
                      placeholder={TEXT.SERVICE.DESC_PLACEHOLDER}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                    />

                    {isEditing ? (
                      <TouchableOpacity
                        style={styles.statusRow}
                        onPress={() => setIsActive((prev) => !prev)}
                      >
                        <View>
                          <Typography variant="bodyMedium" style={styles.statusTitle}>
                            {TEXT.SERVICE_VERSION.PACKAGE_STATUS_LABEL}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {isActive
                              ? TEXT.SERVICE_VERSION.PACKAGE_STATUS_ACTIVE
                              : TEXT.SERVICE_VERSION.PACKAGE_STATUS_INACTIVE}
                          </Typography>
                        </View>
                        <Ionicons
                          name={isActive ? 'toggle' : 'toggle-outline'}
                          size={32}
                          color={isActive ? theme.colors.success : theme.colors.text.disabled}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {isEditing ? (
                    <View style={styles.section}>
                      <Typography variant="bodyMedium" style={styles.sectionTitle}>
                        {TEXT.SERVICE_VERSION.PACKAGE_VERSIONS_TITLE}
                      </Typography>
                      <Typography variant="body" color="secondary" style={styles.summaryText}>
                        {TEXT.SERVICE_VERSION.PACKAGE_VERSIONS_SUMMARY.replace('{count}', String(versionsCount))}
                      </Typography>
                      <CustomButton
                        label={TEXT.SERVICE_VERSION.MANAGE_VERSIONS}
                        variant="outline"
                        onPress={() => router.push(`/mentor/services/${id}/versions` as any)}
                        style={styles.inlineButton}
                      />
                    </View>
                  ) : (
                    <View style={styles.section}>
                      <Typography variant="bodyMedium" style={styles.sectionTitle}>
                        {TEXT.SERVICE_VERSION.PACKAGE_VERSIONS_TITLE}
                      </Typography>
                      <Typography variant="body" color="secondary" style={styles.summaryText}>
                        {TEXT.SERVICE_VERSION.PACKAGE_VERSIONS_CREATE_HINT}
                      </Typography>
                      <View style={styles.createVersionSection}>
                        <TextInput
                          label={TEXT.SERVICE_VERSION.PRICE_LABEL}
                          placeholder="300000"
                          keyboardType="numeric"
                          value={price}
                          onChangeText={(value) => {
                            setPrice(value);
                            setErrors((prev) => ({ ...prev, price: '' }));
                          }}
                          error={errors.price}
                        />
                        <TextInput
                          label={TEXT.SERVICE_VERSION.DURATION_LABEL}
                          placeholder="60"
                          keyboardType="numeric"
                          value={duration}
                          onChangeText={(value) => {
                            setDuration(value);
                            setErrors((prev) => ({ ...prev, duration: '' }));
                          }}
                          error={errors.duration}
                        />
                        <TextInput
                          label={TEXT.SERVICE_VERSION.DELIVERY_TYPE_LABEL}
                          placeholder={TEXT.SERVICE_VERSION.DELIVERY_TYPE_PLACEHOLDER}
                          value={deliveryType}
                          onChangeText={setDeliveryType}
                          helperText={TEXT.SERVICE_VERSION.DELIVERY_TYPE_HELPER}
                        />
                      </View>
                    </View>
                  )}

                  {!isEditing ? (
                    <View style={styles.section}>
                      <View style={styles.curriculumHeader}>
                        <Typography variant="bodyMedium" style={styles.sectionTitle}>
                          {TEXT.CURRICULUM.TITLE}
                        </Typography>
                        <TouchableOpacity 
                          onPress={addCurriculum}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={{ padding: 4 }}
                        >
                          <Typography variant="label" style={styles.addLink}>
                            {TEXT.CURRICULUM.ADD_ITEM}
                          </Typography>
                        </TouchableOpacity>
                      </View>
                      {errors.curriculum_general ? (
                        <Typography variant="caption" color="error" style={styles.submitError}>
                          {errors.curriculum_general}
                        </Typography>
                      ) : null}
                      {curriculums.map((item, index) => (
                        <View key={index} style={styles.curriculumCard}>
                          <View style={styles.curriculumCardHeader}>
                            <Typography variant="label" style={styles.statusTitle}>
                              {TEXT.CURRICULUM.ITEM_LABEL.replace('{index}', String(index + 1))}
                            </Typography>
                            {curriculums.length > 1 ? (
                              <TouchableOpacity 
                                onPress={() => removeCurriculum(index)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={{ padding: 4 }}
                              >
                                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                              </TouchableOpacity>
                            ) : null}
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
                  ) : null}
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
                label={isEditing ? TEXT.SERVICE_VERSION.SAVE_AND_OPEN_VERSIONS : TEXT.SERVICE_VERSION.CREATE_PACKAGE}
                onPress={handleSave}
                loading={loading}
                disabled={fetching}
              />
            </View>
          </View>
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
  scroll: { padding: 20, paddingBottom: 100 },
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
    marginBottom: 12,
  },
  statusRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    lineHeight: 22,
  },
  createVersionSection: {
    marginTop: 16,
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
  inlineButton: {
    marginTop: 16,
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
