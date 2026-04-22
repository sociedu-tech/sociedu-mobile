import React, { useState } from 'react';
import { 
  View, StyleSheet, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '../../../src/components/typography/Typography';
import { CustomButton } from '../../../src/components/button/CustomButton';
import { TextInput } from '../../../src/components/form/TextInput';
import { theme } from '../../../src/theme/theme';
import { TEXT } from '../../../src/core/constants/strings';
import { mentorService } from '../../../src/core/services/mentorService';
import { CreateCurriculumRequest } from '../../../src/core/types';

export default function MentorServiceFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  
  // ─── FORM STATE ───
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [curriculums, setCurriculums] = useState<CreateCurriculumRequest[]>([
    { title: '', description: '', orderIndex: 1, duration: 0 }
  ]);

  // ─── VALIDATION STATE ───
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = TEXT.SERVICE.VALIDATION.NAME_REQUIRED;
    if (!price || isNaN(Number(price)) || Number(price) <= 0) newErrors.price = TEXT.SERVICE.VALIDATION.PRICE_MIN;
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) newErrors.duration = TEXT.VALIDATION.REQUIRED;
    
    // Curriculum validation
    if (curriculums.length === 0) {
      newErrors.curriculum_general = TEXT.SERVICE.VALIDATION.CURRICULUM_MIN;
    } else {
      curriculums.forEach((c, idx) => {
        if (!c.title.trim()) newErrors[`curriculum_${idx}_title`] = TEXT.VALIDATION.REQUIRED;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        isActive: true,
        versions: [{
          price: Number(price),
          duration: Number(duration),
          deliveryType: 'ONLINE',
          isDefault: true,
          curriculums: curriculums.map((c, i) => ({ ...c, orderIndex: i + 1 }))
        }]
      };

      await mentorService.saveService(payload);
      // Có thể dùng Store để update state nếu cần
      router.back();
    } catch (err: any) {
      setErrors({ submit: err.message || TEXT.COMMON.ERROR });
    } finally {
      setLoading(false);
    }
  };

  // ─── DYNAMIC CURRICULUM HANDLERS ───
  const addCurriculum = () => {
    setCurriculums(prev => [...prev, { title: '', description: '', orderIndex: prev.length + 1, duration: 0 }]);
  };

  const removeCurriculum = (index: number) => {
    if (curriculums.length <= 1) {
      setErrors(prev => ({ ...prev, curriculum_general: TEXT.SERVICE.VALIDATION.CURRICULUM_MIN }));
      return;
    }
    setCurriculums(prev => prev.filter((_, i) => i !== index));
    // Clear validation error if any
    setErrors(prev => {
      const newErr = { ...prev };
      delete newErr.curriculum_general;
      delete newErr[`curriculum_${index}_title`];
      return newErr;
    });
  };

  const updateCurriculum = (index: number, field: keyof CreateCurriculumRequest, value: string) => {
    setCurriculums(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear inline error when typing
    if (errors[`curriculum_${index}_${field}`]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[`curriculum_${index}_${field}`];
        return newErr;
      });
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
            
            {/* Header */}
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                {isEditing ? TEXT.SERVICE.FORM_TITLE_EDIT : TEXT.SERVICE.FORM_TITLE_ADD}
              </Typography>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
              
              <View style={styles.section}>
                <TextInput
                  label={TEXT.SERVICE.NAME_LABEL}
                  placeholder={TEXT.SERVICE.NAME_PLACEHOLDER}
                  value={name}
                  onChangeText={(txt) => { setName(txt); setErrors(p => ({...p, name: ''})); }}
                  error={errors.name}
                />
                <TextInput
                  label={TEXT.SERVICE.DESC_LABEL}
                  placeholder={TEXT.SERVICE.DESC_PLACEHOLDER}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInput
                      label={TEXT.SERVICE.PRICE_LABEL}
                      placeholder="0"
                      value={price}
                      onChangeText={(txt) => { setPrice(txt); setErrors(p => ({...p, price: ''})); }}
                      keyboardType="numeric"
                      error={errors.price}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <TextInput
                      label={TEXT.SERVICE.DURATION_LABEL}
                      placeholder="60"
                      value={duration}
                      onChangeText={(txt) => { setDuration(txt); setErrors(p => ({...p, duration: ''})); }}
                      keyboardType="numeric"
                      error={errors.duration}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <View style={styles.rowBetween}>
                  <Typography variant="h3">{TEXT.SERVICE.CURRICULUM_SECTION}</Typography>
                  <TouchableOpacity onPress={addCurriculum}>
                    <Typography variant="label" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      {TEXT.SERVICE.ADD_SESSION}
                    </Typography>
                  </TouchableOpacity>
                </View>
                
                {errors.curriculum_general && (
                  <Typography variant="caption" color="error" style={{ marginTop: 8 }}>
                    {errors.curriculum_general}
                  </Typography>
                )}

                {curriculums.map((curr, idx) => (
                  <View key={idx} style={styles.currCard}>
                    <View style={styles.currHeader}>
                      <Typography variant="label" style={{ fontWeight: '700' }}>Buổi {idx + 1}</Typography>
                      <TouchableOpacity onPress={() => removeCurriculum(idx)} style={{ padding: 4 }}>
                        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      placeholder={TEXT.SERVICE.SESSION_TITLE_PLACEHOLDER}
                      value={curr.title}
                      onChangeText={(txt) => updateCurriculum(idx, 'title', txt)}
                      error={errors[`curriculum_${idx}_title`]}
                      style={{ marginBottom: 12 }}
                    />
                    <TextInput
                      placeholder={TEXT.SERVICE.SESSION_DESC_PLACEHOLDER}
                      value={curr.description}
                      onChangeText={(txt) => updateCurriculum(idx, 'description', txt)}
                      multiline
                    />
                  </View>
                ))}
              </View>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {errors.submit && (
                <Typography variant="caption" color="error" style={{ marginBottom: 8, textAlign: 'center' }}>
                  {errors.submit}
                </Typography>
              )}
              <CustomButton 
                label={TEXT.COMMON.SAVE}
                onPress={handleSave}
                loading={loading}
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
  scroll: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 8 },
  row: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  divider: { height: 1, backgroundColor: theme.colors.border.default, marginVertical: 24 },
  
  currCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  footer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  }
});
