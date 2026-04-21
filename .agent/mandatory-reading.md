# Mandatory Reading

Checklist này xác định các file phải đọc trước khi viết code. Không áp dụng kiểu đọc lướt toàn repo; chỉ đọc đúng nhóm file liên quan để giữ context sạch nhưng đủ.

## 1. Mọi task đều phải đọc

- `AGENTS.md`
- `.agent/instruction.md`
- `.agent/mandatory-reading.md`
- `.agent/skill.md`
- `package.json`
- `tsconfig.json`

## 2. Nếu sửa routing hoặc auth

Phải đọc:

- `app/_layout.tsx`
- `app/(auth)/_layout.tsx`
- `src/core/store/authStore.ts`
- `src/core/services/authService.ts`
- `src/core/api.ts`
- `src/components/ProtectedRoute.tsx`

Đọc thêm nếu sửa trang auth:

- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `src/core/adapters/authAdapter.ts`
- `src/core/types.ts`

## 3. Nếu sửa tab, màn hình người dùng hoặc điều hướng chính

Phải đọc:

- `app/(tabs)/_layout.tsx`
- screen đang sửa trong `app/(tabs)/...`
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `RESPONSIVE_FIX_APPLIED.md`

## 4. Nếu sửa booking flow

Phải đọc:

- `app/(tabs)/bookings.tsx`
- `app/booking/[id].tsx`
- `src/core/store/bookingStore.ts`
- `src/core/services/bookingService.ts`
- `src/core/adapters/bookingAdapter.ts`
- `src/core/types.ts`

## 5. Nếu sửa mentor, profile, user data

Phải đọc:

- screen đang sửa
- `src/core/services/mentorService.ts` hoặc `src/core/services/userService.ts`
- adapter tương ứng trong `src/core/adapters/`
- `src/core/types.ts`

## 6. Nếu sửa UI component hoặc design system

Phải đọc:

- component đang sửa trong `src/components/`
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `src/theme/breakpoints.ts`
- `RESPONSIVE_FIX_APPLIED.md`

Nếu component có file responsive đi kèm thì đọc cả file đó, ví dụ:

- `src/components/button/buttonResponsive.ts`
- `src/components/ui/cardResponsive.ts`
- `src/components/ui/sectionResponsive.ts`
- `src/components/form/textInputResponsive.ts`
- `src/components/typography/typographyResponsive.ts`

## 7. Nếu sửa service, adapter hoặc API layer

Phải đọc:

- `src/core/api.ts`
- `src/core/config.ts`
- service đang sửa
- adapter liên quan
- `src/core/types.ts`

Nếu repo đang chạy mock cho domain đó thì đọc thêm:

- file trong `src/core/mocks/api/`
- file dữ liệu liên quan trong `src/core/mocks/data/`

## 8. Nếu sửa kiến trúc, quy chuẩn hoặc cách làm việc

Phải đọc:

- `docs/ARCHITECTURE.md`
- `.agent/project-context.md`
- `.agent/workflows.md`
- `.agent/instruction.md`
- `.agent/skill.md`

## 9. Nếu thêm file mới

Trước khi thêm file mới, phải tự kiểm tra:

- Có file hiện có nào đủ gần để mở rộng không
- File mới thuộc `app/`, `src/core/`, `src/components/`, `src/theme/` hay `docs/`
- Tên file đã đúng convention chưa
- File mới có làm trùng trách nhiệm với file khác không

## 10. Điều kiện được phép bắt đầu code

Chỉ bắt đầu viết code khi:

- đã đọc nhóm file bắt buộc theo loại task
- đã xác định source of truth
- đã biết cách verify thay đổi
- đã biết file nào không nên đụng vào
