# BÁO CÁO TOÀN DIỆN DỰ ÁN UNISHARE MOBILE (MASTER VERSION)
**Vai trò:** Senior Mobile Architect / Tech Lead
**Tài liệu:** Giải mã kiến trúc và triết lý xây dựng hệ thống

---

## 1. Giới thiệu & Mục tiêu thiết kế
- **UniShare Mobile** được xây dựng với triết lý: "Trải nghiệm mượt mà, mã nguồn sạch sẽ".
- **Mục tiêu:** Tạo ra một môi trường kết nối Mentor-Mentee chuyên nghiệp, nơi công nghệ đóng vai trò là cầu nối ẩn (seamless) để người dùng tập trung vào tri thức.

## 2. Phân tích Đối tượng & Yêu cầu
- **Thách thức:** Xử lý dữ liệu thời gian thực và thanh toán trực tuyến trên môi trường di động vốn có mạng chập chờn.
- **Giải pháp:** Xây dựng hệ thống Offline-first (lưu cache) và cơ chế Polling thanh toán bền vững.

## 3. User Flow Chi tiết (Luồng thực thi)
1. **Flow Onboarding:** Khởi chạy -> Kiểm tra Hydration (Trạng thái bộ nhớ) -> Điều hướng tự động (Auth Guard).
2. **Flow Booking:** Tìm kiếm (Search/Filter) -> Duyệt Profile -> Chọn Gói (Package) -> Thanh toán (Payment Gateway) -> Xác nhận (Order Polling).

## 4. Kiến trúc Tech Stack (The "WHY")
- **React Native (Expo):** Chọn vì khả năng Hot Reload nhanh và thư viện `expo-router` cực kỳ hiện đại.
- **Zustand:** Chọn vì tính tối giản. So với Redux (quá nhiều boilerplate), Zustand giúp Store của UniShare gọn nhẹ và dễ gỡ lỗi hơn.
- **Axios:** Chọn vì Interceptor. Đây là "linh hồn" của bảo mật hệ thống, cho phép tự động xử lý Token mà không cần code lặp lại ở 100 màn hình.

## 5. Giải mã Cấu trúc thư mục (The Folder Map)

| Folder | Chức năng (What) | Triết lý thiết kế (Why) |
| :--- | :--- | :--- |
| **app/** | Định nghĩa Routing hệ thống | Sử dụng Folder-based routing giúp cấu trúc app trùng khớp hoàn toàn với cấu trúc thư mục, cực kỳ dễ tìm kiếm file màn hình. |
| **src/core/** | Core Logic & Data Engine | Đây là "bộ não" của App. Tách riêng để đảm bảo logic nghiệp vụ không bị phụ thuộc vào UI (Platform Independent). |
| **src/components/** | Hệ thống UI Components | Xây dựng theo hướng lắp ghép (LEGO). Giúp thay đổi giao diện toàn app chỉ bằng cách sửa 1 file component duy nhất. |
| **src/theme/** | Hạ tầng Visual & Design System | Quản lý "mã gen" của App. Giúp app đồng bộ tuyệt đối về màu sắc và xử lý Responsive chuyên nghiệp cho mọi kích cỡ màn hình. |

## 6. Danh sách File & Vai trò chi tiết (The File Map)

### 6.1 Logic & Networking (`src/core/`)
- **`api.ts`:** Cấu hình gốc Axios. **Why:** Chứa Interceptor xử lý lỗi 401 tự động, gánh vác toàn bộ việc bảo mật Networking.
- **`types.ts`:** Định nghĩa 100% Interface dữ liệu. **Why:** Tài liệu hóa hệ thống bằng code. Bất kỳ ai mở file này ra đều hiểu cấu trúc dữ liệu Mentor, Booking hay User trông như thế nào.
- **`adapters/mentorAdapter.ts`:** Chuyển đổi dữ liệu API. **Why:** Backend trả về dữ liệu Snake_case, App dùng CamelCase. Adapter là lớp bảo vệ giúp App không bị crash nếu Backend đổi format dữ liệu.
- **`services/orderService.ts`:** Xử lý thanh toán. **Why:** Tách biệt logic thanh toán (Polling, Payment URL) ra khỏi UI màn hình để xử lý các ca lỗi mạng phức tạp.
- **`store/authStore.ts`:** Quản lý trạng thái login. **Why:** Dùng Zustand kết hợp AsyncStorage để app "không bao giờ quên" người dùng trừ khi họ đăng xuất.

### 6.2 Hệ thống UI (`src/components/`)
- **`typography/Typography.tsx`:** Quản lý chữ nghĩa. **Why:** Mobile có nhiều loại màn hình, Typography chuẩn giúp chữ không bị vỡ hoặc quá nhỏ trên các máy độ phân giải cao.
- **`button/CustomButton.tsx`:** Nút bấm đa năng. **Why:** Quản lý tập trung các trạng thái `loading`, `disabled`, giúp user luôn có phản hồi xúc giác (Haptic/Visual feedback).
- **`ui/Card.tsx`:** Khung chứa nội dung. **Why:** Tạo sự nhất quán cho bố cục app qua hiệu ứng đổ bóng và bo góc tiêu chuẩn.

### 6.3 Cơ sở hạ tầng (`src/theme/`)
- **`responsiveUtils.ts`:** Các hàm Scale tỷ lệ. **Why:** Đây là bí quyết giúp app UniShare chạy đẹp trên cả điện thoại Android 4 inch cũ kỹ lẫn iPad Pro 12.9 inch đời mới.
- **`breakpoints.ts`:** Các cột mốc màn hình. **Why:** Chia ngạch SmartPhone và Tablet để app tự thay đổi Layout (VD: Tablet hiện 2 cột, Phone hiện 1 cột).

## 7. Giải mã thiết kế UI/UX (Experience Design)
- **Bottom Tab bar:** Luôn đặt ở dưới (Thumb-friendly) để người dùng thao tác 1 tay linh hoạt.
- **Glassmorphism:** Tab bar trong suốt tạo cảm giác không gian rộng hơn.
- **Empty States:** Khi dữ liệu rỗng, app không để màn hình trắng mà hiển thị minh họa thân thiện, giúp giữ chân người dùng.

## 8. State Management & Flow
- Sử dụng mô hình **One-way Data Flow** (Dữ liệu đi một chiều): 
  - Action (User bấm nút) -> Service (Gọi API) -> Store (Cập nhật data) -> UI (Tự động re-render).
- Điều này giúp việc gỡ lỗi trở nên cực kỳ đơn giản vì ta luôn biết dữ liệu bắt đầu từ đâu.

## 9. Xử lý API & Networking (Dual-Interceptor)
- **Request Interceptor:** Tiêm Token vào header.
- **Response Interceptor:** Chặn lỗi 401, tự gọi refresh, sau đó tự gửi lại request ban đầu. Đây là kỹ thuật cao cấp nhất trong xử lý Networking mobile.

## 10. Authentication Flow & Security
- Bảo mật 2 lớp: Token lưu trong `AsyncStorage` (mã hóa cấp độ app) và Interceptor kiểm soát mọi ngõ ngách ra vào của dữ liệu.

## 11. Navigation System (Architecture)
- Sử dụng Stack đè lên Tab. 
- **Tab Layout:** Cho các trang song song.
- **Stack Layout:** Cho các trang chi tiết, tạo luồng đi vào (Drill-down) và quay ra rõ ràng.

## 12. Tối ưu UX qua Micro-interactions
- Các hiệu ứng Animation mượt mà khi chuyển màn hình và phản hồi Dot-indicator giúp tăng tính "Human-centic" (hướng về con người) của sản phẩm.

## 13. Deep Walkthrough: VNPay Integration
- Giải thích logic Polling: Vì VNPay là cửa sổ ngoài, App cần liên tục kiểm tra (Poll) trạng thái đơn hàng phía backend để cập nhật giao diện ngay khi giao dịch hoàn tất.

## 14. Performance & Best Practices
- Sử dụng `FlashList` (hoặc FlatList tối ưu) để xử lý danh sách hàng nghìn Mentor mà không gây lag máy.
- Giảm thiểu Re-render bằng cách dùng `Selectors` trong Zustand.

## 15. Kết luận & Tầm nhìn
Dự án UniShare Mobile được xây dựng không chỉ để chạy, mà để trở thành một sản phẩm có thể thương mại hóa nhờ cấu trúc mã nguồn bền vững, khả năng mở rộng tốt và trải nghiệm người dùng tinh tế.

---
*Tài liệu nội bộ dành cho đội ngũ Tech Lead & Mentor UniShare.*
