import { Redirect } from "expo-router";

// Trang Index đóng vai trò làm ngã tư đường ban đầu (Initial Route "/")
// Root Layout (_layout.tsx) sẽ lập tức can thiệp và gạt user qua Tab Marketplace hoặc Welcome tuỳ thuộc vào biến isAuthenticated.
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
