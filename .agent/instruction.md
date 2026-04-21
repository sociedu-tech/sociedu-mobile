# Instruction

Tài liệu này định nghĩa quy trình làm việc chuẩn cho agent khi lập trình trong repo `sociedu-mobile`.

## 1. Mục tiêu làm việc

- Giữ codebase dễ mở rộng, dễ review và dễ debug.
- Tôn trọng kiến trúc Expo Router + `src/core` hiện có.
- Ưu tiên tính nhất quán hơn là thêm pattern mới.
- Mọi thay đổi phải giải quyết đúng bài toán, không chỉ làm code chạy tạm.

## 2. Quy trình bắt buộc trước khi viết code

### Bước 1: Đọc tài liệu lõi

Phải đọc:

1. `AGENTS.md`
2. `.agent/instruction.md`
3. `.agent/mandatory-reading.md`
4. `.agent/skill.md`

### Bước 2: Đọc tài liệu theo loại task

Xem bảng trong `.agent/mandatory-reading.md` rồi mở đúng file liên quan trước khi sửa.

### Bước 3: Xác định phạm vi thay đổi

- Screen hay route: nằm trong `app/`
- Service, API, adapter, store: nằm trong `src/core/`
- UI tái sử dụng: nằm trong `src/components/`
- Theme hoặc responsive: nằm trong `src/theme/`
- Tài liệu: nằm trong `.agent/` hoặc `docs/`

### Bước 4: Kiểm tra ràng buộc hiện tại

- Auth flow đang đi qua `app/_layout.tsx` và `src/core/store/authStore.ts`
- Mock API đang bật trong `src/core/config.ts`
- API base URL đang hard-code trong `src/core/api.ts`
- Responsive system đã được thiết lập và có lịch sử trong `RESPONSIVE_FIX_APPLIED.md`

### Bước 5: Chỉ viết code sau khi trả lời được 4 câu hỏi

1. File nào là nguồn sự thật cho thay đổi này
2. Thay đổi này ảnh hưởng route nào, store nào, service nào
3. Có cần giữ tương thích với mock data hay không
4. Cách kiểm tra thay đổi sau khi sửa là gì

## 3. Kiến trúc chuẩn cần tuân thủ

## 3.1 Routing

- `app/` chỉ nên chứa route, layout và logic màn hình.
- Không dồn business logic nặng trực tiếp vào file route nếu có thể đưa xuống `src/core/`.
- Khi thêm màn hình mới, giữ đúng quy ước Expo Router.

## 3.2 Core logic

- `src/core/services/`: gọi API, orchestration nghiệp vụ theo domain
- `src/core/adapters/`: map DTO từ backend sang model app
- `src/core/store/`: state chia sẻ giữa nhiều màn hình
- `src/core/api.ts`: axios instance, token handling, error handling
- `src/core/config.ts`: cờ cấu hình dùng chung

## 3.3 UI layer

- `src/components/` là nguồn component nội bộ chính.
- Không tạo component dùng lại trong screen nếu có khả năng tái sử dụng rõ ràng.
- Thư mục `components/` ở root là dấu vết starter; không mở rộng thêm nếu không có lý do rất rõ.

## 3.4 Theme và responsive

- Màu, spacing, typography phải bám `src/theme/theme.ts`.
- Responsive phải dùng utility trong `src/theme/responsiveUtils.ts` hoặc hệ hiện có.
- Không hard-code kích thước lớn trong screen nếu đã có scale function.

## 4. Nguyên tắc code

## 4.1 Nguyên tắc tổ chức

- Một file chỉ nên có một trách nhiệm chính.
- Tên file phản ánh đúng trách nhiệm.
- Tránh tạo utility chung chung kiểu `helpers.ts` nếu chức năng không rõ ràng.
- Không thêm abstraction mới nếu chưa có ít nhất hai nơi cần dùng.

## 4.2 Nguyên tắc TypeScript

- Giữ `strict` an toàn; không mở rộng `any` trừ trường hợp bị chặn bởi dữ liệu ngoài và đã cô lập biên.
- Ưu tiên type/domain model rõ ràng hơn object inline dài.
- DTO backend và model dùng trong app cần tách bằng adapter nếu khác shape.

## 4.3 Nguyên tắc state

- Local UI state để trong screen/component.
- Shared state mới đưa vào Zustand.
- Không tạo store mới chỉ để chứa state của một màn hình đơn lẻ nếu không có nhu cầu chia sẻ thật.
- Không duplicating source of truth giữa store và component state trừ khi là derived UI state.

## 4.4 Nguyên tắc API và service

- Không gọi `axios` trực tiếp trong screen.
- Mọi lời gọi network đi qua service.
- Mọi biến đổi dữ liệu backend có ý nghĩa domain đi qua adapter.
- Error message trả về UI phải có ngữ nghĩa, tránh đẩy raw response lên screen.

## 4.5 Nguyên tắc UI

- Ưu tiên dùng `Typography`, `CustomButton` và component dùng lại sẵn có.
- Giữ style rõ ràng, tránh inline style lớn trong JSX.
- Không tự ý đổi visual language của app khi task không yêu cầu.

## 4.6 Nguyên tắc comment và tài liệu

- Chỉ comment khi logic khó đọc hoặc có ràng buộc nghiệp vụ không hiển nhiên.
- Nếu thay đổi làm lệch tài liệu `.agent/`, `docs/` hoặc note responsive thì phải cập nhật lại.

## 5. Quy chuẩn code

### Đặt tên

- Route file: theo chuẩn Expo Router, ví dụ `index.tsx`, `[id].tsx`, `edit.tsx`
- Component: `PascalCase`
- Hook, service, util: `camelCase`
- Hằng số: `UPPER_SNAKE_CASE` khi thật sự là constant bất biến

### Import

- Ưu tiên alias `@/` khi repo đã hỗ trợ, nhưng phải giữ nhất quán trong file đang sửa.
- Không tạo chuỗi import tương đối dài khó đọc nếu có alias phù hợp.

### Cấu trúc file screen

Thứ tự ưu tiên:

1. imports
2. constants/types cục bộ
3. component chính
4. helper function nhỏ nếu thật sự gắn chặt với screen
5. styles

### Cấu trúc file service

1. imports
2. base constant
3. service object
4. các method theo nhóm chức năng

## 6. Checklist trước khi sửa code

- Đã đọc file bắt buộc trong `.agent/mandatory-reading.md`
- Đã xác định source of truth
- Đã xác định file nào không nên sửa
- Đã xác định cần test bằng gì: lint, flow auth, flow route, flow responsive

## 7. Checklist trước khi kết thúc task

- Code chạy hợp lý về mặt logic
- Không phá route hiện có
- Không phá auth redirect
- Không thêm hard-code mới trái quy chuẩn
- Không tạo duplication rõ ràng
- Đã cập nhật tài liệu nếu thay đổi kiến trúc/quy trình

## 8. Những điều cấm

- Không gọi API trực tiếp trong screen.
- Không hard-code thêm `API_BASE_URL` hoặc env logic rải rác.
- Không mở rộng thư mục `components/` ở root như nơi chứa component chính mới.
- Không bỏ qua responsive system khi sửa UI.
- Không thêm state toàn cục cho vấn đề cục bộ.
- Không sửa file lớn theo kiểu rewrite toàn bộ khi chỉ cần thay đổi nhỏ.

## 9. Tiêu chuẩn hoàn thành

Một thay đổi chỉ được xem là hoàn thành khi:

- đúng mục tiêu nghiệp vụ
- khớp kiến trúc hiện tại
- không tạo nợ kỹ thuật rõ ràng
- có cách kiểm tra hợp lý
- có thể được người khác đọc và tiếp tục mà không phải đoán ý định
