# AGENTS.md

Tai lieu entrypoint cho moi coding agent lam viec trong repo `sociedu-mobile`.

## Bat buoc doc theo thu tu

1. `.agent/instruction.md`
2. `.agent/mandatory-reading.md`
3. `.agent/skill.md`

Khong bat dau sua code neu chua doc du 3 file tren.

## Skill ngoai da cai

Repo da cai cac skill commit-duoc trong `.agents/skills/`:

- `vercel-react-native-skills`
- `vercel-composition-patterns`

Chi dung chung khi task thuc su can. Tai lieu noi bo trong `.agent/` van la nguon uu tien cao hon.

## Muc tieu repo

- Ung dung mobile dung Expo + React Native + Expo Router.
- Kien truc hien tai uu tien feature-based trong `src/features/`.
- Muc tieu la de nhieu nguoi co the code song song theo feature ma it xung dot.
- Moi thay doi phai giu on dinh auth flow, router va responsive UI.

## Kien truc hien tai

- `app/`: route entry mong cua Expo Router, uu tien chi `export { default } ...` sang feature screen.
- `src/features/`: source of truth theo domain.
- `src/components/`: UI dung chung toan app.
- `src/core/`: ha tang dung chung va compatibility wrapper.
- `src/theme/`: theme token, breakpoint, responsive utilities.

## Lenh co ban

- Cai dependency: `npm install`
- Chay dev server: `npm run start`
- Chay Android: `npm run android`
- Chay iOS: `npm run ios`
- Chay web: `npm run web`
- Lint: `npm run lint`

## Nguyen tac ngan

- Uu tien sua trong `src/features/` neu task thuoc mot domain da duoc tach.
- Chi sua `app/` khi can them route moi hoac doi route wiring.
- Khong coi file wrapper trong `src/core/services`, `src/core/store`, `src/core/adapters` la noi uu tien de viet logic moi.
- Khong goi API truc tiep trong screen.
- Khong hard-code them API URL, auth rule hoac style token moi trong screen.
- Moi thay doi phai giu nhat quan voi Expo Router, auth flow va responsive system hien co.

## Tai lieu ho tro

- Quy trinh va nguyen tac: `.agent/instruction.md`
- Checklist bat buoc doc truoc khi code: `.agent/mandatory-reading.md`
- Ky nang va cach giai quyet van de chuan: `.agent/skill.md`
- Danh gia skill ben ngoai phu hop: `.agent/external-skills.md`
- Context du an: `.agent/project-context.md`
- Workflow thao tac: `.agent/workflows.md`
- Kien truc du an hien tai: `docs/ARCHITECTURE.md`
- Quy chuan responsive: `docs/ARCHITECTURE.md`
