import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.secondary,
      headerShown: true,
    }}>
      <Tabs.Screen 
        name="marketplace" 
        options={{ 
          title: 'Tài liệu',
          headerShown: false, // Để Nested Stack tự điều phối Header
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="mentor" 
        options={{ 
          title: 'Chuyên gia',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
