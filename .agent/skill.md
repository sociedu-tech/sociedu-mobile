# Skill

Tài liệu này mô tả bộ kỹ năng chuẩn mà một coding agent phải vận dụng khi xử lý task trong `sociedu-mobile`.

## 1. Kỹ năng đọc hiểu codebase

Agent phải:

- Xác định lớp của vấn đề trước: route, UI, service, adapter, store, theme hay config.
- Tìm source of truth thay vì sửa theo cảm tính tại nơi lỗi biểu hiện.
- Đọc tối thiểu nhưng đúng file, dựa trên `.agent/mandatory-reading.md`.
- Phân biệt component nội bộ chính ở `src/components/` với starter component ở `components/`.

Chuẩn mực:

- Không kết luận kiến trúc chỉ từ một file.
- Không sửa khi chưa hiểu luồng dữ liệu vào và ra.

## 2. Kỹ năng phân rã vấn đề

Khi nhận task, agent phải tách thành các câu hỏi:

1. Đây là vấn đề về hiển thị, điều hướng, dữ liệu hay trạng thái
2. Lỗi xuất hiện ở đâu và nguồn gốc nằm ở đâu
3. Cần sửa tối thiểu ở mấy lớp để giải quyết tận gốc
4. Tiêu chí hoàn thành là gì

Chuẩn mực:

- Ưu tiên root cause hơn patch bề mặt.
- Nếu một bug xuất phát từ data shape, sửa ở adapter hoặc service trước khi vá UI.

## 3. Kỹ năng làm việc với routing

Agent phải:

- Hiểu Expo Router dùng file-based routing.
- Kiểm tra ảnh hưởng của `_layout.tsx` trước khi thêm hoặc đổi route.
- Bảo vệ auth flow và role guard khi thêm màn hình protected.

Chuẩn mực:

- Không chỉ thêm screen rồi để auth tự xử lý ngầm.
- Nếu màn hình cần role đặc biệt, phải quyết định rõ dùng `ProtectedRoute` hay root guard.

## 4. Kỹ năng làm việc với auth

Agent phải:

- Đọc `authStore`, `authService`, `api.ts`, các auth layout trước khi chỉnh.
- Giữ thống nhất giữa cache user, access token, refresh token và redirect logic.
- Tôn trọng flow hydrate khi app khởi động.

Chuẩn mực:

- Không tạo auth state cục bộ trong screen thay cho store.
- Không bypass flow refresh token bằng cách chèn logic ad hoc vào UI.

## 5. Kỹ năng làm việc với API và data mapping

Agent phải:

- Xem backend trả DTO gì, app cần model gì.
- Dùng adapter để map thay vì nhồi logic transform ở screen.
- Kiểm tra mock path nếu `USE_MOCK = true`.

Chuẩn mực:

- Screen không gọi API trực tiếp.
- Service không nên trả shape khó dùng nếu adapter có thể chuẩn hóa.
- Error handling phải đủ cho UI nhưng không làm mất ngữ nghĩa.

## 6. Kỹ năng quản lý state

Agent phải:

- Giữ local UI state trong component nếu chỉ dùng tại chỗ.
- Chỉ đưa vào Zustand khi state cần chia sẻ, lưu giữ hoặc phối hợp giữa nhiều màn.
- Tránh source of truth kép.

Chuẩn mực:

- Không tạo store chỉ để lưu state form tạm thời nếu không cần.
- Không đồng thời lưu một entity ở cả store và nhiều local state mà không có lý do.

## 7. Kỹ năng xây UI và responsive

Agent phải:

- Bám `theme.ts`, `responsiveUtils.ts` và các responsive helper có sẵn.
- Giữ visual language hiện có nếu task không yêu cầu redesign.
- Kiểm tra màn nhỏ và màn lớn khi sửa spacing, typography, kích thước card hoặc avatar.

Chuẩn mực:

- Không hard-code kích thước mới một cách tùy tiện.
- Không bỏ qua `RESPONSIVE_FIX_APPLIED.md` khi sửa UI quan trọng.

## 8. Kỹ năng thêm feature mới

Quy trình chuẩn:

1. Xác định route mới hay chỉ là thành phần của route cũ
2. Xác định domain liên quan
3. Thêm service trước nếu feature cần dữ liệu
4. Thêm adapter nếu response shape không trực tiếp phù hợp
5. Thêm store chỉ khi cần chia sẻ state
6. Dựng UI bằng component hiện có trước, chỉ tạo component mới khi thật sự cần

Chuẩn mực:

- Feature mới phải đi đúng lớp.
- Không lấy screen làm trung tâm chứa hết mọi logic.

## 9. Kỹ năng debug chuẩn mực

Khi gặp lỗi, agent phải đi theo thứ tự:

1. Xác định nơi lỗi biểu hiện
2. Lần ngược source of truth
3. Kiểm tra luồng dữ liệu vào
4. Kiểm tra điều kiện biên
5. Chỉ sửa sau khi có giả thuyết rõ ràng
6. Verify lại ở đúng luồng gây lỗi

Khuôn mẫu debug:

- Lỗi route: kiểm tra file route, `_layout`, redirect logic, params
- Lỗi auth: kiểm tra hydrate, token storage, interceptor, `isAuthenticated`, `userRole`
- Lỗi UI: kiểm tra theme, responsive helper, props truyền vào, dữ liệu adapter
- Lỗi API: kiểm tra `USE_MOCK`, endpoint, unwrap, adapter, error mapping
- Lỗi state: kiểm tra nơi ghi state, nơi đọc state, timing fetch, loading/error state

Chuẩn mực:

- Không fix bằng cách thêm condition chồng condition nếu chưa rõ nguyên nhân.
- Không xóa logic cũ chỉ vì chưa hiểu nó.

## 10. Kỹ năng refactor

Refactor chỉ được xem là chuẩn khi:

- giảm duplication
- tăng độ rõ trách nhiệm
- không đổi hành vi ngoài ý muốn
- không làm route hoặc flow auth khó hiểu hơn

Chuẩn mực:

- Refactor nhỏ, có mục tiêu rõ.
- Không gom quá nhiều thay đổi không liên quan trong một lần sửa.

## 11. Kỹ năng review trước khi kết thúc

Trước khi chốt task, agent phải tự hỏi:

1. Thay đổi này có đúng source of truth không
2. Có phá mock flow không
3. Có phá responsive không
4. Có làm route hoặc auth khó đoán hơn không
5. Có tạo file mới không cần thiết không
6. Có chỗ nào nên cập nhật tài liệu không

## 12. Kỹ năng giao tiếp kỹ thuật

Agent phải:

- Nói rõ đang sửa lớp nào và vì sao.
- Nêu được giả định khi chưa đủ dữ liệu.
- Báo rủi ro thật, không nói chung chung.
- Kết luận bằng thay đổi thực tế, kiểm tra đã làm, và phần chưa kiểm tra được.

Chuẩn mực:

- Ngắn gọn nhưng cụ thể.
- Không dùng ngôn ngữ mơ hồ như "có thể ổn", "chắc là được" nếu chưa verify.

## 13. Quy tắc giải quyết vấn đề chuẩn

Mọi task nên đi theo khung này:

1. Hiểu yêu cầu
2. Xác định lớp bị ảnh hưởng
3. Đọc file bắt buộc
4. Chốt source of truth
5. Sửa ở đúng lớp
6. Kiểm tra lại luồng liên quan
7. Cập nhật tài liệu nếu quy tắc hoặc kiến trúc thay đổi

Nếu không chắc nên sửa ở đâu:

- ưu tiên đọc thêm
- không ưu tiên đoán
- không vá ở UI khi lỗi đến từ domain/data/config
