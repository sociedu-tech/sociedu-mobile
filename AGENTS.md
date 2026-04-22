# AGENTS.md

Tai lieu entrypoint cho moi coding agent lam viec trong repo `sociedu-mobile`.

## Bat buoc doc theo thu tu

1. `.agent/instruction.md`
2. `.agent/mandatory-reading.md`
3. `.agent/skill.md`

Khong bat dau sua code neu chua doc du 3 file tren.

## Muc tieu repo

- Ung dung mobile dung Expo + React Native + Expo Router.
- Kien truc hien tai la feature-based, trong do `src/features/` la source of truth.
- `app/` chi dong vai tro route entry, layout va route wiring.
- Moi thay doi phai giu on dinh auth flow, router, role guard va responsive UI.

## Kien truc hien tai

- `app/`: route files va layout cua Expo Router. Uu tien chi `export { default }` sang feature screen.
- `src/features/`: logic theo domain. Hien co `admin`, `auth`, `booking`, `home`, `marketplace`, `mentor`, `message`, `profile`.
- `src/components/`: UI tai su dung toan app.
- `src/core/`: ha tang chung, API layer, mocks va compatibility wrappers.
- `src/theme/`: tokens, breakpoints, responsive utilities.
- `docs/`: tai lieu kien truc va quy uoc bo sung.

## Lenh co ban

- Cai dependency: `npm install`
- Chay dev server: `npm run start`
- Chay Android: `npm run android`
- Chay iOS: `npm run ios`
- Chay web: `npm run web`
- Lint: `npm run lint`

## Nguyen tac ngan

- Uu tien sua trong `src/features/<feature>/...` neu domain da duoc tach.
- Chi sua `app/` khi can route moi, doi route wiring hoac doi layout.
- Khong goi API truc tiep trong screen.
- Khong dat business logic nang trong file route.
- Khong xem `src/core/services`, `src/core/store`, `src/core/adapters` la noi viet logic domain moi neu feature da ton tai.
- Khong hard-code them API URL, auth rule hoac style token moi trong screen.
- Khi sua UI, phai giu nhat quan voi `src/theme` va responsive system hien co.

## Tai lieu ho tro

- Quy trinh va nguyen tac: `.agent/instruction.md`
- Checklist bat buoc doc truoc khi code: `.agent/mandatory-reading.md`
- Ky nang va cach debug: `.agent/skill.md`
- Context du an: `.agent/project-context.md`
- Workflow thao tac: `.agent/workflows.md`
- Danh gia external skills: `.agent/external-skills.md`
- Kien truc du an: `docs/ARCHITECTURE.md`
- Tong quan he thong va bai toan nghiep vu: `SYSTEM.md`

## External skills da cai

- `vercel-react-native-skills`
- `vercel-composition-patterns`

Tai lieu trong `.agent/` van la nguon uu tien cao hon skill ngoai.
