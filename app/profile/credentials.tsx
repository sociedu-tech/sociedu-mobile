import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { Section } from '../../src/components/ui/Section';
import { CustomButton } from '../../src/components/button/CustomButton';
import { TextInput } from '../../src/components/form/TextInput';
import { userService } from '../../src/core/services/userService';
import { User } from '../../src/core/types';
import { LoadingState } from '../../src/components/states/LoadingState';
import { useAuthStore } from '../../src/core/store/authStore';

// ──────────────────────────────────────────────────────────────────────
// MÀN HÌNH CHÍNH
// ──────────────────────────────────────────────────────────────────────
export default function CredentialsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const activeMode = useAuthStore((s) => s.activeMode);

  // Modal states
  const [modalType, setModalType] = useState<'education' | 'experience' | 'certificate' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await userService.getMe();
      setUser(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu hồ sơ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = (type: string, id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa mục này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            if (type === 'education') await userService.deleteEducation(id);
            if (type === 'experience') await userService.deleteExperience(id);
            if (type === 'certificate') await userService.deleteCertificate(id);
            fetchData();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa mục này');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Typography variant="h3" style={{ color: '#FFF', fontWeight: '800' }}>
              {activeMode === 'mentor' ? 'Chứng chỉ & Kinh nghiệm' : 'Hồ sơ năng lực'}
            </Typography>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HỌC VẤN */}
        <SectionHeader
          title="Học vấn"
          icon="school"
          onAdd={() => {
            setEditingItem(null);
            setModalType('education');
          }}
        />
        <View style={styles.listContainer}>
          {user?.educations?.map((edu) => (
            <CredentialItem
              key={edu.id}
              title={edu.institution}
              subtitle={`${edu.degree} - ${edu.fieldOfStudy}`}
              time={`${edu.startYear} - ${edu.endYear || 'Hiện tại'}`}
              onEdit={() => {
                setEditingItem(edu);
                setModalType('education');
              }}
              onDelete={() => handleDelete('education', edu.id)}
            />
          ))}
          {(!user?.educations || user.educations.length === 0) && <EmptyList text="Chưa có thông tin học vấn" />}
        </View>

        {/* KINH NGHIỆM */}
        <SectionHeader
          title="Kinh nghiệm"
          icon="briefcase"
          onAdd={() => {
            setEditingItem(null);
            setModalType('experience');
          }}
        />
        <View style={styles.listContainer}>
          {user?.experiences?.map((exp) => (
            <CredentialItem
              key={exp.id}
              title={exp.company}
              subtitle={exp.role}
              time={`${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Hiện tại'}`}
              onEdit={() => {
                setEditingItem(exp);
                setModalType('experience');
              }}
              onDelete={() => handleDelete('experience', exp.id)}
            />
          ))}
          {(!user?.experiences || user.experiences.length === 0) && (
            <EmptyList text={activeMode === 'mentor' ? 'Chưa có thông tin kinh nghiệm' : 'Thêm kinh nghiệm để Mentor hiểu rõ bạn'} />
          )}
        </View>

        {/* CHỨNG CHỈ */}
        <SectionHeader
          title="Chứng chỉ"
          icon="medal"
          onAdd={() => {
            setEditingItem(null);
            setModalType('certificate');
          }}
        />
        <View style={styles.listContainer}>
          {user?.certificates?.map((cert) => (
            <CredentialItem
              key={cert.id}
              title={cert.name}
              subtitle={cert.issuer}
              time={`${new Date(cert.issueDate).getFullYear()}`}
              onEdit={() => {
                setEditingItem(cert);
                setModalType('certificate');
              }}
              onDelete={() => handleDelete('certificate', cert.id)}
            />
          ))}
          {(!user?.certificates || user.certificates.length === 0) && (
            <EmptyList text={activeMode === 'mentor' ? 'Chưa có chứng chỉ nào' : 'Bổ sung chứng chỉ nếu có'} />
          )}
        </View>
      </ScrollView>

      {/* MODALS */}
      {modalType === 'education' && (
        <EducationModal
          visible={!!modalType}
          item={editingItem}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            setModalType(null);
            fetchData();
          }}
        />
      )}
      {modalType === 'experience' && (
        <ExperienceModal
          visible={!!modalType}
          item={editingItem}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            setModalType(null);
            fetchData();
          }}
        />
      )}
      {modalType === 'certificate' && (
        <CertificateModal
          visible={!!modalType}
          item={editingItem}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            setModalType(null);
            fetchData();
          }}
        />
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────
// COMPONENTS CON
// ──────────────────────────────────────────────────────────────────────

function SectionHeader({ title, icon, onAdd }: { title: string; icon: any; onAdd: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
        <Typography variant="label" style={styles.sectionLabel}>{title}</Typography>
      </View>
      <TouchableOpacity 
        onPress={onAdd} 
        style={styles.addBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

function CredentialItem({ title, subtitle, time, onEdit, onDelete }: any) {
  return (
    <Card style={styles.itemCard}>
      <View style={{ flex: 1 }}>
        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>{title}</Typography>
        <Typography variant="caption" color="secondary" style={{ marginTop: 2 }}>{subtitle}</Typography>
        <Typography variant="caption" color="muted" style={{ marginTop: 4 }}>{time}</Typography>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Ionicons name="pencil" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Ionicons name="trash" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function EmptyList({ text }: { text: string }) {
  return (
    <View style={styles.emptyBox}>
      <Typography variant="caption" color="muted">{text}</Typography>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────
// MODAL FORMS
// ──────────────────────────────────────────────────────────────────────

function EducationModal({ visible, item, onClose, onSuccess }: any) {
  const [institution, setInstitution] = useState(item?.institution || '');
  const [degree, setDegree] = useState(item?.degree || '');
  const [field, setField] = useState(item?.fieldOfStudy || '');
  const [startYear, setStartYear] = useState(item?.startYear ? String(item.startYear) : '');
  const [endYear, setEndYear] = useState(item?.endYear ? String(item.endYear) : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!institution || !degree || !field || !startYear) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    setLoading(true);
    try {
      const data = {
        institution,
        degree,
        fieldOfStudy: field,
        startYear: parseInt(startYear),
        endYear: endYear ? parseInt(endYear) : undefined,
      };
      if (item) {
        await userService.updateEducation(item.id, data);
      } else {
        await userService.addEducation(data);
      }
      onSuccess();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={{ marginBottom: 20 }}>{item ? 'Sửa học vấn' : 'Thêm học vấn'}</Typography>
          <ScrollView>
            <TextInput label="Trường học *" value={institution} onChangeText={setInstitution} />
            <TextInput label="Bằng cấp *" value={degree} onChangeText={setDegree} />
            <TextInput label="Ngành học *" value={field} onChangeText={setField} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}><TextInput label="Năm bắt đầu *" keyboardType="numeric" value={startYear} onChangeText={setStartYear} /></View>
              <View style={{ flex: 1 }}><TextInput label="Năm kết thúc" keyboardType="numeric" value={endYear} onChangeText={setEndYear} /></View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <CustomButton label="Hủy" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <CustomButton label="Lưu" variant="primary" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ExperienceModal({ visible, item, onClose, onSuccess }: any) {
  const [company, setCompany] = useState(item?.company || '');
  const [role, setRole] = useState(item?.role || '');
  const [startDate, setStartDate] = useState(item?.startDate || '');
  const [endDate, setEndDate] = useState(item?.endDate || '');
  const [description, setDescription] = useState(item?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!company || !role || !startDate) {
      Alert.alert('Lỗi', 'Vui lòng điền các trường bắt buộc');
      return;
    }
    setLoading(true);
    try {
      const data = {
        company,
        role,
        startDate,
        endDate: endDate || null,
        description,
      };
      if (item) {
        await userService.updateExperience(item.id, data);
      } else {
        await userService.addExperience(data);
      }
      onSuccess();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={{ marginBottom: 20 }}>{item ? 'Sửa kinh nghiệm' : 'Thêm kinh nghiệm'}</Typography>
          <ScrollView>
            <TextInput label="Công ty *" value={company} onChangeText={setCompany} />
            <TextInput label="Vai trò *" value={role} onChangeText={setRole} />
            <TextInput label="Ngày bắt đầu (YYYY-MM-DD) *" value={startDate} onChangeText={setStartDate} />
            <TextInput label="Ngày kết thúc (Để trống nếu hiện tại)" value={endDate} onChangeText={setEndDate} />
            <TextInput label="Mô tả" isTextArea value={description} onChangeText={setDescription} />
          </ScrollView>
          <View style={styles.modalFooter}>
            <CustomButton label="Hủy" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <CustomButton label="Lưu" variant="primary" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CertificateModal({ visible, item, onClose, onSuccess }: any) {
  const [name, setName] = useState(item?.name || '');
  const [issuer, setIssuer] = useState(item?.issuer || '');
  const [date, setDate] = useState(item?.issueDate || '');
  const [url, setUrl] = useState(item?.credentialUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !issuer || !date) {
      Alert.alert('Lỗi', 'Vui lòng điền các trường bắt buộc');
      return;
    }
    setLoading(true);
    try {
      const data = {
        name,
        issuer,
        issueDate: date,
        credentialUrl: url || null,
      };
      if (item) {
        await userService.updateCertificate(item.id, data);
      } else {
        await userService.addCertificate(data);
      }
      onSuccess();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={{ marginBottom: 20 }}>{item ? 'Sửa chứng chỉ' : 'Thêm chứng chỉ'}</Typography>
          <ScrollView>
            <TextInput label="Tên chứng chỉ *" value={name} onChangeText={setName} />
            <TextInput label="Tổ chức cấp *" value={issuer} onChangeText={setIssuer} />
            <TextInput label="Ngày cấp (YYYY-MM-DD) *" value={date} onChangeText={setDate} />
            <TextInput label="Đường dẫn chứng chỉ (Link)" value={url} onChangeText={setUrl} />
          </ScrollView>
          <View style={styles.modalFooter}>
            <CustomButton label="Hủy" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <CustomButton label="Lưu" variant="primary" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { height: 120, paddingHorizontal: 20 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingHorizontal: 20, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { textTransform: 'uppercase', color: theme.colors.text.muted, fontSize: 12, letterSpacing: 1 },
  listContainer: { paddingHorizontal: 20, gap: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 8 },
  emptyBox: { padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border.default },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 24, paddingBottom: 20 },
  addBtn: { padding: 4 },
});
