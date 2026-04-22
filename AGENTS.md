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
- Kien truc uu tien tach route, UI, service, store va adapter.
- Muc tieu hien tai la giu codebase de mo rong, de review va khong pha flow auth hoac responsive UI da co.

## Lenh co ban

- Cai dependency: `npm install`
- Chay dev server: `npm run start`
- Chay Android: `npm run android`
- Chay iOS: `npm run ios`
- Chay web: `npm run web`
- Lint: `npm run lint`

## Nguyen tac ngan

- Uu tien doc tai lieu trong `.agent/` truoc khi sua.
- Uu tien sua trong `app/`, `src/`, `docs/`; tranh dung vao `components/` starter neu khong that su can.
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
