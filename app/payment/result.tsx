import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CustomButton } from '../../src/components/button/CustomButton';
import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { TEXT } from '../../src/core/constants/strings';

export default function PaymentResultScreen() {
  const router = useRouter();
  const { status, orderId } = useLocalSearchParams<{ status: 'success' | 'failed'; orderId: string }>();
  const isSuccess = status === 'success';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.iconWrapper, !isSuccess && styles.iconWrapperError]}>
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={80}
            color={isSuccess ? theme.colors.success : theme.colors.error}
          />
        </View>

        <Typography variant="h1" style={styles.title}>
          {isSuccess ? TEXT.PAYMENT_RESULT.SUCCESS_TITLE : TEXT.PAYMENT_RESULT.FAILURE_TITLE}
        </Typography>

        <Typography variant="body" color="secondary" style={styles.message}>
          {isSuccess ? TEXT.PAYMENT_RESULT.SUCCESS_MESSAGE : TEXT.PAYMENT_RESULT.FAILURE_MESSAGE}
        </Typography>

        {orderId && (
          <View style={styles.orderBox}>
            <Typography variant="caption" color="secondary">Mã đơn hàng: </Typography>
            <Typography variant="caption" style={styles.orderId}>{orderId}</Typography>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {isSuccess ? (
          <>
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_VIEW_BOOKINGS}
              onPress={() => router.replace('/(tabs)/bookings')}
              style={styles.button}
            />
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_HOME}
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
              style={[styles.button, { marginTop: 12 }]}
            />
          </>
        ) : (
          <>
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_RETRY}
              onPress={() => router.back()}
              style={styles.button}
            />
            <CustomButton
              label={TEXT.PAYMENT_RESULT.BTN_HOME}
              variant="outline"
              onPress={() => router.replace('/(tabs)')}
              style={[styles.button, { marginTop: 12 }]}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapperError: {
    backgroundColor: `${theme.colors.error}15`,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '800',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  orderBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  orderId: { fontWeight: '600' },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: { width: '100%' },
});
