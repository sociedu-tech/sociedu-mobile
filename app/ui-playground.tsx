import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../src/theme/theme';
import { Typography } from '../src/components/typography/Typography';
import { CustomButton } from '../src/components/button/CustomButton';
import { TextInput } from '../src/components/form/TextInput';
import { Checkbox } from '../src/components/form/Checkbox';
import { DataTable, Column } from '../src/components/display/DataTable';
import { LoadingState } from '../src/components/states/LoadingState';
import { EmptyState } from '../src/components/states/EmptyState';
import { ErrorState } from '../src/components/states/ErrorState';
import { Ionicons } from '@expo/vector-icons';

interface MockData {
  id: string;
  name: string;
  status: string;
}

export default function UIPlaygroundScreen() {
  const [checked, setChecked] = useState(true);

  const mockColumns: Column<MockData>[] = [
    { id: '1', label: 'Tên Mentor', accessor: 'name', flex: 2 },
    { 
      id: '2', 
      label: 'Trạng thái', 
      accessor: 'status', 
      flex: 1,
      render: (item) => (
        <View style={styles.statusBadge}>
          <Typography variant="caption" color="inverse">{item.status}</Typography>
        </View>
      )
    },
  ];

  const mockData: MockData[] = [
    { id: '1', name: 'Dr. Aris Thorne', status: 'Active' },
    { id: '2', name: 'Prof. John Doe', status: 'Busy' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Typography variant="h1" color="primary" style={styles.pageTitle}>
          Design System
        </Typography>

        {/* 1. Typography */}
        <Section title="1. Typography">
          <Typography variant="h1">Heading 1 (32px)</Typography>
          <Typography variant="h2">Heading 2 (24px)</Typography>
          <Typography variant="h3">Heading 3 (20px)</Typography>
          <Typography variant="body" color="secondary">Body (16px) - Secondary color</Typography>
          <Typography variant="bodyMedium">Body Medium (16px - 500)</Typography>
          <Typography variant="label">Label (14px) - Used for inputs</Typography>
          <Typography variant="caption">Caption (12px)</Typography>
        </Section>

        {/* 2. Buttons */}
        <Section title="2. Buttons">
          <View style={styles.row}>
            <CustomButton label="Primary" variant="primary" style={styles.flexBtn} />
            <CustomButton label="Secondary" variant="secondary" style={styles.flexBtn} />
          </View>
          <View style={styles.row}>
            <CustomButton label="Outline" variant="outline" style={styles.flexBtn} />
            <CustomButton label="Ghost" variant="ghost" style={styles.flexBtn} />
          </View>
          <View style={styles.row}>
            <CustomButton label="Destructive" variant="destructive" style={styles.flexBtn} />
            <CustomButton label="Loading..." loading style={styles.flexBtn} />
          </View>
          <CustomButton 
            label="With Icon" 
            icon={<Ionicons name="sparkles" size={20} color="white" />} 
          />
        </Section>

        {/* 3. Form Elements */}
        <Section title="3. Form Elements">
          <TextInput 
            label="Email Address" 
            placeholder="example@gmail.com" 
            leftIcon="mail-outline" 
          />
          <TextInput 
            label="Password" 
            placeholder="Enter password" 
            leftIcon="lock-closed-outline" 
            rightIcon="eye-outline"
            secureTextEntry
          />
          <TextInput 
            label="Error Input" 
            placeholder="Invalid value" 
            error="Email không hợp lệ"
          />
          <Checkbox 
            value={checked} 
            onValueChange={setChecked} 
            label="Tôi đồng ý với điều khoản sử dụng" 
          />
        </Section>

        {/* 4. Data Display */}
        <Section title="4. Data Display (Table)">
          <View style={{ height: 200 }}>
            <DataTable<MockData> 
              data={mockData} 
              columns={mockColumns} 
              keyExtractor={(item) => item.id} 
            />
          </View>
        </Section>

        {/* 5. UI States */}
        <Section title="5. UI States (Inline View)">
          <View style={styles.stateWrapper}>
            <LoadingState fullScreen={false} />
          </View>
          <View style={styles.stateWrapper}>
            <ErrorState fullScreen={false} onRetry={() => {}} />
          </View>
          <View style={styles.stateWrapper}>
            <EmptyState fullScreen={false} title="Thư mục trống" description="Chưa có tài liệu nào ở đây." />
          </View>
        </Section>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
  <View style={styles.section}>
    <Typography variant="h3" style={styles.sectionTitle}>{title}</Typography>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2, // Extra padding for scrolling
  },
  pageTitle: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionContent: {
    gap: theme.spacing.md,
    flexDirection: 'column', 
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flexBtn: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  stateWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    height: 300,
    marginBottom: theme.spacing.md,
    overflow: 'hidden'
  }
});
