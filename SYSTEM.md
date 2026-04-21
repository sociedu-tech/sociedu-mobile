# Unishare Mobile — System Overview

> **Đọc file này trước khi làm bất kỳ task nào.** Đây là tài liệu tổng quan hệ thống cho ứng dụng mobile để AI Agent nắm bài toán, actor, luồng nghiệp vụ và ràng buộc kiến trúc nhanh nhất.

---

## 1. Unishare Mobile là gì?

`Unishare Mobile` là ứng dụng client cho nền tảng kết nối **Mentee** với **Mentor**. Người dùng có thể:

- đăng ký, đăng nhập và duy trì phiên làm việc trên thiết bị
- khám phá mentor và hồ sơ chuyên môn
- xem gói dịch vụ / nội dung marketplace
- tạo đơn hàng, đi tới bước thanh toán
- theo dõi booking và các session học
- nhắn tin với đối tác trong quá trình học
- quản lý hồ sơ cá nhân, học vấn, kinh nghiệm và chứng chỉ

Ứng dụng mobile không chứa business rule backend. Vai trò của mobile là:

- hiển thị đúng flow nghiệp vụ cho từng actor
- gọi API qua service layer
- chuẩn hóa dữ liệu backend qua adapter
- điều phối state màn hình và session
- bảo vệ auth flow, role-based access và responsive UI

---

## 2. Các Actor trong mobile

| Actor | Mô tả trên mobile |
|---|---|
| **GUEST** | Người chưa đăng nhập, chỉ đi được các màn auth/onboarding |
| **MENTEE** | Người học, khám phá mentor, mua dịch vụ, theo dõi booking, nhắn tin |
| **MENTOR** | Người hướng dẫn, quản lý hồ sơ mentor, booking, session và dashboard |
| **ADMIN** | Quản trị viên, truy cập khu vực quản trị qua role guard |

> `userRole` hiện được hydrate từ `authStore` và dùng bởi `ProtectedRoute` để chặn route theo vai trò.

---

## 3. Bản đồ Module mobile

| Module | Trách nhiệm |
|---|---|
| `auth-session` | Đăng nhập, đăng ký, hydrate session, logout, refresh token |
| `app-shell-routing` | Root layout, tab layout, redirect auth, protected screen orchestration |
| `user-profile` | Hồ sơ cá nhân, bio, location, education, experience, languages, certificates |
| `mentor-discovery` | Danh sách mentor, chi tiết mentor, ghép profile công khai với mentor data |
| `service-marketplace` | Hiển thị package/service hoặc nội dung marketplace cho người dùng khám phá |
| `order-payment` | Checkout, nhận `paymentUrl`, polling trạng thái đơn hàng sau thanh toán |
| `booking-session` | Danh sách booking, chi tiết booking, cập nhật session, meeting URL, evidence |
| `chat` | Danh sách hội thoại, chi tiết tin nhắn, session card trong chat |
| `role-dashboards` | Màn mentor dashboard, admin dashboard, role gating |
| `ui-system` | Theme, responsive utilities, reusable components, loading/error/empty states |

---

## 4. Luồng Nghiệp Vụ Xuyên Module (Happy Path)

```text
[Người dùng mở app]
  app-shell-routing
    → auth-session.hydrate()
      → nếu chưa đăng nhập: /(auth)/welcome | /(auth)/login
      → nếu đã đăng nhập: /(tabs)

[Mentee khám phá mentor]
  mentor-discovery (danh sách mentor)
    → mentor-discovery (chi tiết mentor + packages)
      → service-marketplace (chọn package/version)

[Mentee mua dịch vụ]
  order-payment.checkout(packageVersionId)
    → backend trả về order + paymentUrl
      → mobile mở payment flow
        → order-payment.pollUntilPaid(orderId)
          → khi paid: booking-session hiển thị booking/sessions

[Quá trình học]
  booking-session (xem danh sách booking)
    → booking-session (xem chi tiết session)
      → mentor cập nhật meeting_url / status
      → mentee mở link meeting
      → booking-session tải evidence hoặc đánh dấu hoàn thành
      → chat hiển thị hội thoại liên quan

[Quản lý hồ sơ]
  user-profile (xem hồ sơ của tôi)
    → user-profile.updateProfile()
    → user-profile CRUD education / experience / language / certificate

[Theo vai trò]
  mentor đăng nhập
    → role-dashboards/mentor
  admin đăng nhập
    → role-dashboards/admin
```

---

## 5. Quan hệ Phụ thuộc trong mobile

```text
app routes/screens
  ├──► src/core/store        (state chia sẻ, hydrate, cache màn hình)
  ├──► src/core/services     (API orchestration theo domain)
  ├──► src/components        (UI tái sử dụng)
  └──► src/theme             (design tokens + responsive)

src/core/services
  ├──► src/core/api.ts       (axios instance, token, interceptors)
  ├──► src/core/adapters     (map DTO sang model UI)
  ├──► src/core/types.ts     (DTO + app models)
  └──► src/core/mocks        (mock API/data khi USE_MOCK = true)

src/core/store
  └──► src/core/services     (fetch/update dữ liệu, không gọi axios trực tiếp)
```

### Quy tắc cứng

- Screen/route **không được** gọi `axios` trực tiếp.
- Screen/route **không được** tự map raw backend DTO nếu adapter đã là nơi chuẩn hóa phù hợp.
- Store **không được** trở thành source of truth thứ hai cho state chỉ mang tính local UI.
- Module A trong mobile **không được** đọc thẳng dữ liệu nội bộ của module B bằng cách bypass service/store đã có.
- Mọi logic auth redirect phải đi qua `app/_layout.tsx` hoặc `ProtectedRoute`, không cài ad hoc trong từng screen.

---

## 6. Kiến trúc thư mục chuẩn của repo

```text
app/
  ├── (auth)/               # welcome, login, register
  ├── (tabs)/               # home, mentor, messages, bookings, profile
  ├── mentor/               # mentor detail, mentor dashboard
  ├── profile/              # profile detail, edit
  ├── booking/              # booking detail
  ├── messages/             # conversation detail
  └── _layout.tsx           # root auth guard + stack declarations

src/
  ├── components/           # reusable UI components
  ├── core/
  │   ├── services/         # domain services gọi API/mock
  │   ├── adapters/         # DTO → app model
  │   ├── store/            # Zustand stores
  │   ├── mocks/            # mock API + mock data
  │   ├── api.ts            # axios instance + interceptors
  │   ├── config.ts         # project flags như USE_MOCK
  │   └── types.ts          # DTO types + mobile domain types
  └── theme/                # theme tokens + responsive utilities
```

---

## 7. Stack Kỹ thuật

- **Framework**: Expo + React Native + Expo Router
- **Language**: TypeScript (`strict: true`)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Auth Handling**: JWT access token + refresh token
- **Navigation**: Expo Router (file-based routing)
- **UI System**: Custom theme + reusable components + responsive utilities
- **Build/Run**: Expo CLI
- **Verification hiện có**: `npm run lint`

---

## 8. Thực trạng codebase hiện tại

### Đã có rõ trong repo

- Auth flow với hydrate ở `app/_layout.tsx`
- Role guard qua `src/components/ProtectedRoute.tsx`
- Services cho `auth`, `user`, `mentor`, `order`, `booking`, `chat`
- Store dùng chung cho `auth` và `booking`
- Adapter tách DTO khỏi model UI
- Mock API toàn cục qua `src/core/config.ts` với `USE_MOCK = true`
- Responsive system qua `src/theme/responsiveUtils.ts`

### Cần hiểu đúng trước khi code

- `API_BASE_URL` hiện đang hard-code trong `src/core/api.ts`
- Chat hiện vẫn là mock-first
- Marketplace tab đang tồn tại nhưng một phần flow còn ở dạng placeholder
- Mentor dashboard và admin dashboard hiện mới là skeleton screens
- Repo có cả `components/` của starter và `src/components/` của dự án; ưu tiên dùng `src/components/`

### Diễn giải quan trọng

Tài liệu này mô tả **bài toán đầy đủ của mobile app**, không đồng nghĩa toàn bộ module đã hoàn thiện trong repo. Khi làm task, luôn phân biệt:

- **Target product flow**: app cần hỗ trợ gì
- **Current implementation**: repo hiện đã làm tới đâu

---

## 9. Flow dữ liệu chuẩn

```text
Backend API DTO
  → service gọi API hoặc mock
    → adapter chuẩn hóa dữ liệu
      → store hoặc screen nhận model UI
        → component render bằng theme/responsive system
```

Ví dụ:

- `authService` gọi login/register/refresh/logout
- `mentorService` ghép mentor data với public profile
- `orderService` checkout rồi polling trạng thái thanh toán
- `bookingService` lấy booking list/detail và cập nhật session

---

## 10. Quy tắc Agent khi làm task trong mobile

1. Đọc `SYSTEM.md` để hiểu bài toán tổng thể
2. Đọc `AGENTS.md`
3. Đọc `.agent/instruction.md`, `.agent/mandatory-reading.md`, `.agent/skill.md`
4. Đọc thêm file theo đúng nhóm task trong `.agent/mandatory-reading.md`
5. Xác định source of truth nằm ở route, service, adapter, store hay theme
6. Chỉ sửa đúng layer gây ra vấn đề, không vá ở UI nếu lỗi đến từ data/service/config
7. Không phá auth redirect, role guard hoặc responsive system
8. Nếu thay đổi kiến trúc hoặc phạm vi nghiệp vụ, cập nhật lại tài liệu liên quan

---

## 11. Checklist trước khi sửa code

- Màn này thuộc actor nào: guest, mentee, mentor hay admin
- Dữ liệu đang đi qua service nào
- Có adapter nào đang là nơi map chuẩn không
- State này nên ở local state hay Zustand store
- Flow này đang chạy mock hay backend thật
- Màn hình có đang nằm dưới auth guard hoặc role guard không
- UI có đang dùng đúng `theme` và `responsiveUtils` không

---

## 12. Một số quyết định kiến trúc không được phá

- `app/_layout.tsx` là cổng kiểm soát session và redirect toàn app
- `src/core/api.ts` là nơi duy nhất cấu hình axios instance và token interceptor
- `src/core/config.ts` là nơi bật/tắt mock dùng chung
- `src/core/types.ts` là nguồn type trung tâm giữa DTO và mobile model
- `src/core/adapters/*` là nơi ưu tiên để sửa khác biệt shape dữ liệu
- `src/theme/*` là nguồn token và responsive scaling; không hard-code lan man trong screen

---

## 13. Mục tiêu của mọi thay đổi

Một thay đổi trong repo mobile chỉ được xem là đúng khi:

- giải quyết đúng bài toán của actor liên quan
- bám kiến trúc Expo Router + `src/core` hiện có
- không tạo source of truth kép
- không phá flow auth hoặc role-based access
- không bỏ qua responsive system
- có cách verify tối thiểu bằng lint hoặc luồng màn hình tương ứng
