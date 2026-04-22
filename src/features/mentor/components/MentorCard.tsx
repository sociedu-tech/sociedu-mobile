import React, { useEffect } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/src/components/typography/Typography';
import { Avatar } from '@/src/components/ui/Avatar';
import { Card } from '@/src/components/ui/Card';
import { User } from '@/src/core/types';
import { scaleFont, scaleSpace } from '@/src/theme/responsiveUtils';
import { theme } from '@/src/theme/theme';

interface MentorCardProps {
  mentor: User;
  index: number;
  onPress: () => void;
}

export function MentorCard({ mentor, index, onPress }: MentorCardProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  const info = mentor.mentorInfo;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Card style={{ marginBottom: theme.spacing.md }}>
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: scaleSpace(12), marginBottom: scaleSpace(14) }}>
            <Avatar uri={mentor.avatar || undefined} size={56} />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: scaleSpace(6) }}>
                <Typography
                  variant="bodyMedium"
                  style={{ color: theme.colors.text.primary, fontWeight: '700', flexShrink: 1 }}
                  numberOfLines={1}
                >
                  {mentor.name}
                </Typography>
                {info?.verificationStatus === 'verified' && (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                )}
              </View>
              <Typography variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: scaleSpace(2) }}>
                {info?.headline || 'Mentor'}
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: scaleSpace(8), marginTop: scaleSpace(6) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scaleSpace(3) }}>
                  <Ionicons name="star" size={12} color={theme.colors.warning} />
                  <Typography
                    variant="caption"
                    style={{ color: theme.colors.text.primary, fontWeight: '700', fontSize: scaleFont(12) }}
                  >
                    {info?.rating?.toFixed(1) || '0.0'}
                  </Typography>
                </View>
                <View
                  style={{
                    width: scaleSpace(4),
                    height: scaleSpace(4),
                    borderRadius: scaleSpace(2),
                    backgroundColor: theme.colors.border.default,
                  }}
                />
                <Typography
                  variant="caption"
                  color="secondary"
                  style={{ fontSize: scaleFont(11), textTransform: 'uppercase', letterSpacing: 0.3 }}
                >
                  {info?.sessionsCompleted || 0} buoi hoc
                </Typography>
              </View>
            </View>
          </View>

          {info?.expertise && info.expertise.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: scaleSpace(6), marginBottom: scaleSpace(14) }}>
              {info.expertise.slice(0, 3).map((exp) => (
                <View
                  key={exp}
                  style={{
                    backgroundColor: theme.colors.background,
                    paddingHorizontal: scaleSpace(12),
                    paddingVertical: scaleSpace(6),
                    borderRadius: scaleSpace(8),
                    borderWidth: 1,
                    borderColor: theme.colors.border.default,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{
                      fontSize: scaleFont(13),
                      fontWeight: '600',
                      color: theme.colors.text.secondary,
                      transform: [{ translateY: -1 }],
                    }}
                  >
                    {exp}
                  </Typography>
                </View>
              ))}
              {info.expertise.length > 3 && (
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primaryLight,
                    paddingHorizontal: scaleSpace(12),
                    paddingVertical: scaleSpace(6),
                    borderRadius: scaleSpace(8),
                    borderWidth: 1,
                    marginLeft: scaleSpace(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{
                      fontSize: scaleFont(13),
                      fontWeight: '600',
                      color: theme.colors.text.secondary,
                      transform: [{ translateY: -1 }],
                    }}
                  >
                    +{info.expertise.length - 3}
                  </Typography>
                </View>
              )}
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopWidth: 1,
              borderTopColor: theme.colors.border.default,
              paddingTop: scaleSpace(14),
            }}
          >
            <View>
              <Typography
                variant="caption"
                style={{
                  fontSize: scaleFont(10),
                  fontWeight: '700',
                  color: theme.colors.text.secondary,
                  letterSpacing: 1,
                  marginBottom: scaleSpace(2),
                }}
              >
                GIA TU
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: scaleSpace(2) }}>
                <Typography variant="h3" style={{ color: theme.colors.text.primary, fontWeight: '800' }}>
                  ${info?.price || 0}
                </Typography>
                <Typography variant="caption" color="secondary">/gio</Typography>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: scaleSpace(6),
                backgroundColor: theme.colors.primary,
                paddingHorizontal: scaleSpace(18),
                paddingVertical: scaleSpace(10),
                borderRadius: theme.borderRadius.lg,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Typography variant="label" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: scaleFont(13) }}>
                Xem ho so
              </Typography>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
}
