import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentResultRedirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    router.replace({
      pathname: '/payment/result',
      params,
    });
  }, [params, router]);

  return null;
}
