# Workflows

## Khi thêm màn hình mới

1. Tạo route file trong `app/` theo cấu trúc Expo Router.
2. Nếu màn hình cần data, thêm service tương ứng trong `src/core/services/`.
3. Nếu dữ liệu từ backend chưa khớp UI model, cập nhật adapter trong `src/core/adapters/`.
4. Chỉ thêm store Zustand nếu state cần chia sẻ giữa nhiều màn hình.

## Khi sửa auth

1. Kiểm tra `app/_layout.tsx` để tránh phá redirect logic.
2. Kiểm tra `src/core/store/authStore.ts` cho hydrate, login, logout.
3. Kiểm tra `src/core/api.ts` cho token storage và refresh flow.
4. Nếu thay shape user/token, cập nhật cả service, adapter và cache AsyncStorage.

## Khi sửa API/backend integration

1. Xác định repo đang chạy mock hay thật qua `src/core/config.ts`.
2. Nếu sửa endpoint hoặc response shape, cập nhật service trước rồi tới adapter.
3. Giữ thông báo lỗi ở mức user-facing, không ném trực tiếp raw server payload ra UI.

## Kiểm tra tối thiểu sau khi sửa

- Chạy `npm run lint`
- Nếu sửa route auth:
  - chưa login phải vào được `/(auth)/login`
  - đã login không được quay lại auth screen
- Nếu sửa UI responsive:
  - kiểm tra trên ít nhất một màn hẹp và một màn rộng

## Những việc nên tránh

- Không hard-code thêm API URL mới trong screen/component.
- Không thêm business logic nặng trực tiếp vào file route nếu có thể đưa sang `src/core`.
- Không tạo state trùng với dữ liệu đã có trong Zustand trừ khi state đó chỉ mang tính local UI.
