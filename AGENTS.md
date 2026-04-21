# AGENTS.md

Hướng dẫn nhanh cho coding agent làm việc trong repo `sociedu-mobile`.

## Mục tiêu dự án

- Ứng dụng mobile dùng Expo + React Native + Expo Router.
- Điều hướng theo file trong thư mục `app/`.
- Logic nghiệp vụ, store và service đặt trong `src/`.

## Lệnh cần biết

- Cài dependency: `npm install`
- Chạy dev server: `npm run start`
- Chạy Android: `npm run android`
- Chạy web: `npm run web`
- Lint: `npm run lint`

## Quy tắc làm việc

- Ưu tiên sửa trong `src/` và `app/`, hạn chế đụng vào starter component trong `components/` nếu không cần.
- Kiểm tra tác động lên Expo Router khi đổi tên file route.
- Auth state đi qua `useAuthStore`; không thêm state auth rời rạc ở screen nếu tránh được.
- Mặc định repo đang bật mock API trong `src/core/config.ts` với `USE_MOCK = true`.
- `src/core/api.ts` đang giữ `API_BASE_URL` hard-code theo LAN IP, cần cẩn trọng nếu đổi để tránh làm hỏng môi trường test cục bộ.

## Kiến trúc nhanh

- Route root: `app/_layout.tsx`
- Nhóm auth: `app/(auth)`
- Nhóm tab chính: `app/(tabs)`
- Detail pages: `app/profile`, `app/mentor`, `app/booking`, `app/messages`
- UI tái sử dụng: `src/components`
- Nghiệp vụ/API/store: `src/core`
- Theme + responsive helpers: `src/theme`

## Đọc thêm

- Chi tiết dự án: `.agent/project-context.md`
- Workflow sửa code: `.agent/workflows.md`
