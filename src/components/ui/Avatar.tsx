import React from 'react';
import { Image, StyleSheet, Text as RNText, View, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { scaleFont } from '../../theme/responsiveUtils';

interface AvatarProps {
  uri?: string | null;
  initials?: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
}

export const Avatar = ({ uri, initials, size = 64, style }: AvatarProps) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}> 
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    ) : (
      <View style={styles.initialsBox}>
        <AvatarInitials initials={initials} size={size} />
      </View>
    )}
  </View>
);

const AvatarInitials = ({ initials, size }: { initials?: string; size: number }) => (
  <View>
    <RNText style={{ fontSize: scaleFont(size / 2.5), fontWeight: '900', color: theme.colors.primary }}>{initials || '?'}</RNText>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initialsBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
