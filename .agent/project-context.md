# Project Context

## Stack hiện tại

- Expo `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- Zustand cho state cục bộ
- Axios cho HTTP client
- AsyncStorage cho token và user cache

## Cấu trúc thư mục

### `app/`

- Chứa route theo file của Expo Router.
- `app/_layout.tsx` là root layout, hydrate auth state rồi redirect theo trạng thái đăng nhập.
- `app/(auth)` chứa `welcome`, `login`, `register`.
- `app/(tabs)` chứa màn chính như `index`, `explore`, `bookings`, `mentor`, `messages`, `profile`, `marketplace`.
- Một số trang chi tiết/protected nằm ngoài tab group như `app/profile/[id].tsx`, `app/mentor/[id].tsx`, `app/booking/[id].tsx`.

### `src/core/`

- `api.ts`: cấu hình Axios instance, interceptor, refresh token flow, storage keys.
- `config.ts`: config dùng chung, hiện bật mock API toàn cục.
- `services/`: service theo domain như auth, booking, mentor, chat, order, user.
- `store/`: Zustand store, hiện có auth và booking.
- `adapters/`: chuẩn hóa payload API sang shape dùng trong app.
- `mocks/`: mock API và mock data để chạy local khi backend chưa sẵn sàng.

### `src/components/`

- Component dùng lại theo nhóm `button`, `form`, `ui`, `states`, `typography`.
- Có các helper responsive đi kèm từng nhóm component.

### `src/theme/`

- Theme token, breakpoint và utility responsive.

## Luồng auth hiện tại

1. App mở lên, `app/_layout.tsx` gọi `useAuthStore().hydrate()`.
2. `authService.getCachedUser()` đọc user đã lưu.
3. Nếu đã đăng nhập, route sẽ bị đẩy khỏi `(auth)` sang `(tabs)`.
4. Nếu chưa đăng nhập, truy cập route ngoài `(auth)` sẽ bị redirect về `/(auth)/login`.
5. Nếu API trả `401`, `src/core/api.ts` sẽ thử refresh token một lần trước khi clear session.

## Điểm cần chú ý khi sửa code

- `API_BASE_URL` đang hard-code theo IP mạng LAN. Nếu cần ổn định môi trường, nên chuyển sang biến môi trường hoặc file config riêng.
- Repo còn giữ cả `components/` mặc định từ starter Expo và `src/components/` do dự án tự xây. Khi sửa UI, xác minh đúng nơi đang được dùng.
- Comment tiếng Việt trong code hiện bị lỗi encoding ở một số file. Tránh rewrite toàn file nếu không cần để hạn chế nhiễu diff.
- Chưa thấy test runner cấu hình sẵn; kiểm tra chính hiện tại là `npm run lint`.

## Vùng ưu tiên khi feature mới

- Màn hình hoặc route mới: thêm trong `app/`
- Logic gọi API: thêm vào `src/core/services/`
- Chuẩn hóa dữ liệu: thêm hoặc sửa trong `src/core/adapters/`
- State chia sẻ: thêm trong `src/core/store/`
- UI tái sử dụng: ưu tiên `src/components/`
