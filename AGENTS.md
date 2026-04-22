# AGENTS.md

Tài liệu entrypoint cho mọi coding agent làm việc trong repo `sociedu-mobile`.

## Bắt buộc đọc theo thứ tự

1. `.agent/instruction.md`
2. `.agent/mandatory-reading.md`
3. `.agent/skill.md`

Không bắt đầu sửa code nếu chưa đọc đủ 3 file trên.

## Mục tiêu repo

- Ứng dụng mobile dùng Expo + React Native + Expo Router.
- Kiến trúc ưu tiên tách route, UI, service, store và adapter.
- Mục tiêu hiện tại là giữ codebase dễ mở rộng, dễ review và không phá flow auth hoặc responsive UI đã có.

## Lệnh cơ bản

- Cài dependency: `npm install`
- Chạy dev server: `npm run start`
- Chạy Android: `npm run android`
- Chạy iOS: `npm run ios`
- Chạy web: `npm run web`
- Lint: `npm run lint`

## Nguyên tắc ngắn

- Ưu tiên đọc tài liệu trong `.agent/` trước khi sửa.
- Ưu tiên sửa trong `app/`, `src/`, `docs/`; tránh đụng vào `components/` starter nếu không thật sự cần.
- Không hard-code thêm API URL, auth rule hoặc style token mới trong screen.
- Mọi thay đổi phải giữ nhất quán với Expo Router, auth flow và responsive system hiện có.

## Tài liệu hỗ trợ

- Quy trình và nguyên tắc: `.agent/instruction.md`
- Checklist bắt buộc đọc trước khi code: `.agent/mandatory-reading.md`
- Kỹ năng và cách giải quyết vấn đề chuẩn: `.agent/skill.md`
- Context dự án: `.agent/project-context.md`
- Workflow thao tác: `.agent/workflows.md`
- Kiến trúc dự án hiện tại: `docs/ARCHITECTURE.md`
- Quy chuẩn responsive: `docs/ARCHITECTURE.md`
