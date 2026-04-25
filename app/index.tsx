import { Redirect } from 'expo-router';

// Entry point: redirect ngay về tab navigator.
// Root Layout (_layout.tsx) sẽ can thiệp redirect về login nếu chưa đăng nhập.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
