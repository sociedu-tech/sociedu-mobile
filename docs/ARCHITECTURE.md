# Kiến trúc Ứng dụng UniShare Mobile

> Tài liệu này mô tả chi tiết kiến trúc, công nghệ và luồng hoạt động của dự án UniShare Mobile (React Native / Expo)

## 1. Tổng quan & Tech Stack

UniShare là nền tảng thương mại điện tử giáo dục và kết nối Mentor dành riêng cho sinh viên, được chuyển đổi từ nền tảng React web. 

**Công nghệ lõi (Tech Stack):**
- **Framework:** React Native + Expo (SDK 50+)
- **Routing:** Expo Router (File-based routing)
- **State Management:** Zustand (Kết hợp AsyncStorage để persist data)
- **Networking:** Axios API Interceptor (Hỗ trợ gắn JWT tự động)
- **UI/Styling:** StyleSheet thuần (Không dùng Tailwind, bám sát Design System tập trung tại thư mục `src/theme/`)

---

## 2. Cấu trúc thư mục (Domain-Driven)

Dự án áp dụng cấu trúc phân tách rõ ràng giữa **Màn hình (Routing)** và **Lõi logic/UI (Core/Components)**:

```text
📦 unishare_mobile
 ┣ 📂 app                   # [Routing] Mọi file ở đây đều tương ứng với 1 URL route
 ┃ ┣ 📂 (auth)              # Routing đăng nhập/đăng ký
 ┃ ┣ 📂 (tabs)              # 3 Tabs chính: Trang chủ, Mentor, Hồ sơ
 ┃ ┣ 📂 profile             # Màn hình liên quan profile chi tiết (edit, public view)
 ┃ ┣ 📂 admin               # Admin dashboard route
 ┃ ┣ 📂 mentor              # Mentor dashboard route
 ┃ ┣ 📜 _layout.tsx         # [Guarding] Nơi chặn Luồng chạy auth app
 ┃ ┗ ...
 ┣ 📂 src                   # [Core System] Chứa tất cả nền tảng không liên quan đến Route
 ┃ ┣ 📂 components          # UI Component dùng chung (Buttons, Inputs, Typography, States)
 ┃ ┣ 📂 core                # Quản trị dữ liệu
 ┃ ┃ ┣ 📂 services          # Các class giao tiếp API (authService, userService, mentorService)
 ┃ ┃ ┣ 📂 store             # File cấu hình Zustand (authStore.ts)
 ┃ ┃ ┣ 📜 api.ts            # Cấu hình Axios chung
 ┃ ┃ ┗ 📜 types.ts          # Type Definitions dùng chung (User, MentorInfo, ...)
 ┃ ┗ 📂 theme               # Constants: bảng màu, kích thước chuẩn
```

---

## 3. Luồng Authentication (Xác thực)

Ứng dụng bắt buộc người dùng trải qua bước đăng nhập với một hệ thống guard tĩnh chặn tại Root.

- **Storage:** Khi mở app, `authStore` gọi hàm `hydrate()` để đọc token và user context từ `@react-native-async-storage/async-storage`.
- **Global Guard:** File `app/_layout.tsx` lắng nghe sự thay đổi của biến `isAuthenticated` từ Zustand.
  - *Nếu chưa đăng nhập:* Bất cứ hành động điều hướng nào (trừ nhóm route `auth`) đều bị `router.replace('/(auth)/login')` để ép về cổng đăng nhập.
  - *Nếu đã đăng nhập:* Nếu người dùng lỡ gọi vào route màn Login, app sẽ tự `router.replace('/(tabs)')`, chặn không cho phép lùi về Login thông qua nút Back thiết bị.
- **Mock Fallback:** Trong giai đoạn phát triển khi chưa có Backend thực, `authService` được cấu hình bắt lỗi Network (Catch). Nếu hỏng mạng, nó tự delay 600ms và cấp phát MOCK TOKEN cho user "Nguyễn Văn A" (Buyer) hoặc "Trần Thị B" (Mentor) để luồng điều hướng của dev không bị tắc.

---

## 4. Phân Quyền (Role-based Access Control)

Người dùng mang 1 trong 3 tệp role chính: `buyer`, `mentor`, `admin`.

1. **Hiển thị Điều hướng:** Tab Profile (của app) sẽ kiểm tra biến `userRole` lưu trên `authStore`. Nếu role là `mentor` thì sẽ render ra menu "Mentor Dashboard". Tương tự như vậy với `admin`.
2. **Component mức độ Routing:** App sở hữu `ProtectedRoute.tsx`. Component này sẽ quấn quanh các view yêu cầu quyền hẹp. Nó tiến hành check mảng `allowedRoles`. Nếu không hợp lệ sẽ hiển thị trang báo lỗi _"Bạn không có quyền truy cập"_ hoặc ErrorState.

---

## 5. Quản lý State (Zustand)

Sự phức tạp của Context API truyền thống bên bản Web bị bãi bỏ do sự cồng kềnh. Mobile sử dụng `Zustand`.
- **Ưu điểm:** Selector siêu nhẹ, tránh re-render cục bộ mỗi khi React node bị thay đổi.
- **Triển khai tại `authStore.ts`:** Nắm giữ `user`, `isAuthenticated`, `loading`, và các hành vi (Action) đồng bộ với AsyncStorage như `login`, `logout` và `hydrate`. 
- *(Các hooks nội bộ cũng được tạo thêm, ví dụ `hooks/useAuth.ts` để gọi nhanh state auth.)*

---

## 6. Giao tiếp API & Networking

Tất cả API đi qua cổng duy nhất `src/core/api.ts` bằng cấu hình của Axios.

- **Interceptor (Bộ đánh chặn):** Tự động chặn các Request gửi đi, kiểm tra `AsyncStorage` lấy Bearer Token và tiêm vào HTTP Header một cách tự động.
- **Service Layer Pattern:** Mỗi một mảng business đều có file tách rời trong `src/core/services/` (ví dụ: `userService`, `mentorService`). Chức năng gọi API được trừu tượng hoá.
- **Thiết kế Resilience (Chống gián đoạn):** Các khối try-catch được bổ sung, khi API timeout hoặc status 500, các UI Service tự động trả về `MOCK_DATA` phù hợp cho phép dev xem được UI màn hình mà không cần Backend bật.

---

## 7. Trạng thái Màn hình hiện tại

| Màn hình | Group/Route | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Splash / Auth Guard** | `app/_layout` | 🟢 Hoàn thành | Tự động phân luồng |
| **Đăng nhập** | `/(auth)/login` | 🟢 Hoàn thành | Dùng Design System |
| **Đăng ký** | `/(auth)/register` | 🟢 Hoàn thành | Dùng Design System |
| **Trang chủ** | `/(tabs)/index` | 🟢 Hoàn thành | Thêm thống kê (Stats) |
| **DS Chuyên gia** | `/(tabs)/mentor` | 🟢 Hoàn thành | Có Modal filter danh mục |
| **Tab Hồ sơ / Menu**| `/(tabs)/profile` | 🟢 Hoàn thành | Phân chia cài đặt theo Role |
| **Chi tiết C.Gia** | `/profile/[id]` | 🔴 Skeleton | Chờ thi công Giai đoạn 2 |
| **Chỉnh sửa User** | `/profile/edit` | 🔴 Skeleton | Chờ thi công Giai đoạn 2 |
| **Mentor Panel** | `/mentor/dashboard` | 🔴 Skeleton | Chờ thi công Giai đoạn 3 |
| **Admin Panel** | `/admin/index` | 🔴 Skeleton | Chờ thi công Giai đoạn 3 |

---

## 8. Theme & Design System

Không định nghĩa bừa code màu Inline trong các View. Toàn bộ thông số thẩm mỹ được gói trong `src/theme/theme.ts`.
- **Colors:** Quản lý quy luật màu Xanh tím `primary: '#4F46E5'`, thẻ Input nhạt `primaryLight`, hoặc cảnh báo `error: '#EF4444'`.
- **Typography:** Text mặc định của hệ thống đã bị che khuất và sử dụng thay bằng bộ token: `h1`, `h2`, `body`, `caption`,...
- **Spacing / BorderRadius:** Đảm bảo viền bo và khoảng cách Margin/Padding trên toàn giao diện có nhịp điệu đồng bộ tuyệt đối (VD: Đều nhân số của 4, 8, 16).

---

## 9. Block Components Dùng Chung

Thư mục `src/components/` đóng vai trò là "Kho lắp ráp" độc lập:
- `Typography.tsx`: Quản lý 100% chữ nghĩa trong app, nhận các biến `variant` và `color`. Vắng mặt thẻ `<Text>` nguyên bản ở các màn.
- `CustomButton.tsx`: Nút ấn có sẵn Effect ripple, thuộc tính `loading`, cho phép gắn `icon`.
- `TextInput.tsx`: Form Input tự động bắt Focus, viền xanh tím nổi khối, gắn kèm Error alert text và tích hợp nút dạng con mắt (passwords).
- State Handler (`EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx`): 3 màn hình cảnh báo tập trung, dùng nhúng trực tiếp vào các ScrollView khi mảng API Data đang bị Delay, Lỗi, hoặc rỗng (bảng dữ liệu null).

---

## 10. Tiếp nối: Việc cần làm (Next Steps)

1. Thiết kế và thi công màn hình `/profile/[id].tsx` với chuẩn React Native Segmented Tab để thay thế cho Navbar nằm ngang cồng kềnh trên Desktop.
2. Hoàn thiện `/profile/edit.tsx` (Form Edit).
3. Đẩy mạnh tích hợp với Backend API thật, sau đó tiến quân sang Giai đoạn thi công các trang quản trị (Admin Dashboard, Mentor Dashboard) để khép kín App.
