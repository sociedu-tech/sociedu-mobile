import React, { useEffect, useState } from 'react';
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

import { Typography } from '../../../src/components/typography/Typography';
import { CustomButton } from '../../../src/components/button/CustomButton';
import { TextInput } from '../../../src/components/form/TextInput';
import { theme } from '../../../src/theme/theme';
import { TEXT } from '../../../src/core/constants/strings';
import { mentorService } from '../../../src/core/services/mentorService';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    void loadPackage();
  }, [id]);

  const loadPackage = async () => {
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
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = TEXT.SERVICE.VALIDATION.NAME_REQUIRED;
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
          isActive,
        });
        router.push(`/mentor/services/${id}/versions` as any);
      } else {
        const pkg = await mentorService.createPackage({
          name: name.trim(),
          description: description.trim(),
          isActive,
        });
        router.replace(`/mentor/services/${pkg.id}/versions` as any);
      }
    } catch (error: any) {
      setErrors({ submit: error?.message || TEXT.COMMON.ERROR });
    } finally {
      setLoading(false);
    }
  };

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
                {isEditing ? TEXT.SERVICE.FORM_TITLE_EDIT : TEXT.SERVICE.FORM_TITLE_ADD}
              </Typography>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
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
                    </View>
                  )}
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
