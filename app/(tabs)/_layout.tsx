import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../src/theme/theme';

/**
 * Tabs Layout
 *
 * Web equivalent mapping:
 *   "/"        -> index    (Home)
 *   "/mentors" -> mentor   (MentorMarketplace)
 *   "/messages"-> messages (Tin nhan)
 *   "/bookings"-> bookings (Lich hen)
 *   n/a        -> profile  (Ho so ca nhan - mobile only)
 *
 * Tab phu `marketplace` duoc an bang `href: null`
 * de tranh hien tren tab bar khi route van ton tai.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chu',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mentor"
        options={{
          title: 'Chuyen gia',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Tin nhan',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={size}
                color={color}
              />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Lich hen',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                size={size}
                color={color}
              />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Ho so',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen name="marketplace" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    position: 'absolute',
    bottom: -6,
  },
});
