# Cấu Trúc Dự Án `sociedu-mobile`

Tài liệu này mô tả cấu trúc thư mục của dự án `sociedu-mobile`, vai trò của từng khu vực chính, và chức năng của các file quan trọng.

## 1. Thư mục gốc

- [app.json](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app.json): cấu hình Expo app, gồm `scheme`, icon, splash, plugin.
- [package.json](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/package.json): khai báo dependency và script chạy app.
- [tsconfig.json](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/tsconfig.json): cấu hình TypeScript.
- [eslint.config.js](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/eslint.config.js): cấu hình lint.
- [expo-env.d.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/expo-env.d.ts): type hỗ trợ môi trường Expo.
- [.env](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/.env): biến môi trường phía mobile nếu có dùng.
- [README.md](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/README.md): mô tả dự án.
- [RESPONSIVE_FIX_APPLIED.md](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/RESPONSIVE_FIX_APPLIED.md): ghi chú thay đổi về responsive.
- `package-lock.json`: khóa version dependency.
- `.expo/`, `node_modules/`: thư mục runtime và tool, không phải code nghiệp vụ.
- `.vscode/`: cấu hình editor.
- `assets/`: ảnh, icon, splash.
- `docs/`: tài liệu nội bộ.
- `scripts/`: script hỗ trợ.
- `components/`, `constants/`, `hooks/`: có vẻ là các thư mục cũ hoặc song song; phần code chính hiện tập trung ở `src/`.

## 2. Thư mục `app/`: route và màn hình

Đây là nơi Expo Router map file thành màn hình.

- [app/_layout.tsx](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app/_layout.tsx): layout gốc, kiểm tra đăng nhập và điều hướng giữa auth/tab.
- [app/index.tsx](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app/index.tsx): entry route mặc định.
- [app/payment-result.tsx](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app/payment-result.tsx): route cầu nối deep link `unisharemobile://payment-result` sang màn kết quả thanh toán thật.

### `app/(auth)/`

Nhóm màn hình xác thực.

- `_layout.tsx`: layout riêng cho auth.
- `welcome.tsx`: màn chào.
- `login.tsx`: đăng nhập.
- `register.tsx`: đăng ký.
- `otp.tsx`, `login-otp-request.tsx`: OTP login và xác thực.
- `forgot-password.tsx`, `reset-password.tsx`: quên mật khẩu.
- `verify-email.tsx`, `verify-email-pending.tsx`: xác minh email.

### `app/(tabs)/`

Nhóm màn chính sau đăng nhập.

- `_layout.tsx`: tab navigator.
- `index.tsx`: dashboard hoặc home tab.
- `mentor.tsx`: danh sách hoặc khám phá mentor.
- `messages.tsx`: danh sách chat.
- `bookings.tsx`: danh sách booking.
- `profile.tsx`: tab hồ sơ cá nhân.

### Các route nghiệp vụ riêng

- `booking/[id].tsx`: chi tiết booking và session.
- `checkout/index.tsx`: xác nhận đơn hàng và mở thanh toán VNPay.
- `package/[id].tsx`: chi tiết gói dịch vụ, chọn version trước khi checkout.
- `payment/result.tsx`: màn kết quả thanh toán, xác nhận order và tìm booking vừa tạo.
- `messages/[id].tsx`: màn chat chi tiết.
- `report/form.tsx`: form báo cáo.
- `dispute/form.tsx`: form khiếu nại.

### Nhóm `mentor/`

Các màn dành cho mentor.

- `mentor/[id].tsx`: hồ sơ mentor public.
- `mentor/dashboard.tsx`: dashboard mentor.
- `mentor/profile-edit.tsx`: sửa hồ sơ mentor.
- `mentor/progress-reports/index.tsx`, `[id].tsx`: danh sách và chi tiết báo cáo tiến độ.
- `mentor/services/index.tsx`: danh sách gói dịch vụ của mentor.
- `mentor/services/form.tsx`: tạo hoặc sửa gói dịch vụ.
- `mentor/services/[packageId]/versions/...`: quản lý version và curriculum của gói.

### Nhóm `profile/`

Màn cá nhân của user.

- `profile/[id].tsx`: xem profile.
- `profile/edit.tsx`: sửa profile.
- `profile/credentials.tsx`: thông tin học vấn, chứng chỉ hoặc năng lực.
- `profile/notifications.tsx`: cài đặt thông báo.
- `profile/phone-verification.tsx`: xác minh số điện thoại.
- `profile/terms.tsx`: điều khoản và chính sách.
- `profile/progress-reports/index.tsx`: báo cáo tiến độ của user.

## 3. Thư mục `src/core/`: lõi nghiệp vụ

Đây là phần quan trọng nhất của logic app.

- [src/core/api.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/api.ts): cấu hình `axios`, interceptor token, refresh token, xử lý lỗi chung.
- [src/core/backend.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/backend.ts): tập trung URL API endpoint.
- [src/core/config.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/config.ts): cấu hình app như `USE_MOCK`, `baseUrl`, `vnpayReturnScheme`.
- [src/core/types.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/types.ts): toàn bộ type và DTO của frontend.
- [src/core/constants/strings.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/constants/strings.ts): text hiển thị trên UI.

### `src/core/services/`

Mỗi file là một service layer gọi API.

- `authService.ts`: login, register, refresh, logout.
- `userService.ts`: profile người dùng.
- `mentorService.ts`: mentor profile, package, version, curriculum.
- `orderService.ts`: checkout, lấy order, poll trạng thái thanh toán.
- `bookingService.ts`: lấy booking, session, tìm booking theo order.
- `conversationService.ts`: chat và conversation.
- `progressReportService.ts`: báo cáo tiến độ.
- `reportService.ts`: report vi phạm.
- `disputeService.ts`: dispute và khiếu nại.

### `src/core/adapters/`

Chuyển dữ liệu backend DTO sang model UI.

- `authAdapter.ts`
- `bookingAdapter.ts`
- `conversationAdapter.ts`
- `mentorAdapter.ts`
- `progressReportAdapter.ts`
- `userAdapter.ts`

Ý nghĩa: backend trả dữ liệu thô, adapter map sang format tiện dùng trong màn hình.

### `src/core/store/`

State toàn cục bằng Zustand.

- `authStore.ts`: trạng thái đăng nhập, user, token mode.
- `bookingStore.ts`: danh sách booking và logic load theo role.

### `src/core/mocks/`

Dữ liệu và API giả khi bật `USE_MOCK`.

- `mocks/api/...`: mock service theo từng domain.
- `mocks/data/...`: mock data thô.
- `chatMocks.ts`, `utils.ts`: tiện ích hỗ trợ mock.

## 4. Thư mục `src/components/`: component UI dùng lại

Đây là phần giao diện tái sử dụng.

### `button/`

- `CustomButton.tsx`: button chuẩn toàn app.
- `buttonResponsive.ts`: style responsive cho button.

### `form/`

- `TextInput.tsx`: input chuẩn.
- `Checkbox.tsx`: checkbox.
- `textInputResponsive.ts`: responsive cho input.

### `states/`

- `LoadingState.tsx`: màn loading.
- `ErrorState.tsx`: màn lỗi.
- `EmptyState.tsx`: trạng thái rỗng.

### `typography/`

- `Typography.tsx`: component text chuẩn hóa variant.
- `typographyResponsive.ts`: responsive cho typography.

### `ui/`

- `Avatar.tsx`: avatar user.
- `Card.tsx`: card wrapper.
- `ListItem.tsx`: item dòng danh sách.
- `Section.tsx`: khối section giao diện.
- `cardResponsive.ts`, `sectionResponsive.ts`: responsive style.

### File riêng

- `ProtectedRoute.tsx`: component bọc route cần auth, dù hiện phần auth guard chính đang nằm ở `app/_layout.tsx`.

## 5. Thư mục `src/theme/`: giao diện và responsive

- `theme.ts`: màu sắc, spacing, shadow, border radius.
- `breakpoints.ts`: ngưỡng responsive.
- `responsiveUtils.ts`: helper responsive.
- `useBreakpoint.ts`: hook đọc breakpoint hiện tại.

## 6. Thư mục `src/hooks/`

- `useDebounce.ts`: hook debounce dùng cho search hoặc input.

## 7. Cách các phần phối hợp với nhau

Một flow điển hình như thanh toán sẽ đi theo chuỗi:

1. Route ở `app/package/[id].tsx`
2. Gọi `mentorService` trong `src/core/services/mentorService.ts`
3. Data từ backend được map qua `mentorAdapter.ts`
4. Text lấy từ `strings.ts`
5. UI dựng bằng `CustomButton`, `Typography`, `Card`
6. Khi checkout thì qua `orderService.ts`
7. Khi xong payment thì `payment/result.tsx` gọi `bookingService.ts`

## 8. Thứ tự nên đọc nếu muốn hiểu nhanh dự án

1. [app/_layout.tsx](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app/_layout.tsx)
2. [app/(tabs)/_layout.tsx](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app/(tabs)/_layout.tsx)
3. [src/core/api.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/api.ts)
4. [src/core/backend.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/backend.ts)
5. [src/core/types.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/types.ts)
6. Một flow cụ thể như [app/checkout/index.tsx](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/app/checkout/index.tsx) và [src/core/services/orderService.ts](D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/services/orderService.ts)
