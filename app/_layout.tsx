import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/core/store/authStore';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments[0]) return;

    const targetPath = segments[0];
    
    // Nếu màn hình thuộc nhánh auth hoặc playground thì xem như màn hình public
    const isPublicPath = targetPath === '(auth)' || targetPath === 'ui-playground';

    if (!isAuthenticated && !isPublicPath) {
      // Đá về welcome nếu chưa đăng nhập và cố vào các tab chính
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && targetPath === '(auth)') {
      // Đã đăng nhập nhưng lại cố vào login -> Đá vào bên trong
      router.replace('/(tabs)/marketplace');
    }
  }, [isAuthenticated, segments]);

  // View Container chính, các routing child sẽ render ở thẻ <Slot />
  return <Slot />;
}
