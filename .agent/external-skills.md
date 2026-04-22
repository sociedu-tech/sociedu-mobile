# External Skills

Tai lieu nay danh gia cac skill chinh thuc trong `vercel-labs/agent-skills` va xac dinh skill nao phu hop voi `sociedu-mobile`.

Nguon tham chieu:

- [Vercel Agent Skills docs](https://vercel.com/docs/agent-resources/skills)
- [Vercel official skills repo](https://github.com/vercel-labs/agent-skills)

## Trang thai hien tai

Da cai vao repo theo project scope + copy:

- `vercel-react-native-skills`
- `vercel-composition-patterns`

Vi tri trong repo:

- `.agents/skills/vercel-react-native-skills`
- `.agents/skills/vercel-composition-patterns`
- `skills-lock.json`

## Ket luan nhanh

Nen dung:

- `vercel-react-native-skills`
- `vercel-composition-patterns`

Chi dung khi can them mot lop guidance React chung:

- `vercel-react-best-practices`

Khong nen cai cho repo nay:

- `web-design-guidelines`
- `vercel-react-view-transitions`
- `deploy-to-vercel`
- `vercel-cli-with-tokens`

## Danh gia tung skill

### vercel-react-native-skills

Muc do phu hop: cao

Ly do:

- Repo nay dung Expo + React Native.
- Skill nay tap trung vao list performance, animation, navigation, UI patterns, state management va platform-specific patterns.
- No bo sung procedural guidance framework-specific ma `.agent` hien tai khong nen nhai lai qua chi tiet.

Nen dung khi:

- sua man hinh mobile
- toi uu list va scroll performance
- them animation, gesture
- lam viec voi image, safe area, keyboard, re-render
- review Expo/React Native patterns

Ket luan:

- Day la skill Vercel phu hop nhat voi repo nay.

### vercel-composition-patterns

Muc do phu hop: kha cao

Ly do:

- Repo nay se tiep tuc mo rong `src/components/`.
- Skill nay huu ich khi refactor component API, tranh boolean prop proliferation va prop drilling.
- Phu hop voi huong giu UI layer ro trach nhiem ma `.agent` dang ap dat.

Nen dung khi:

- refactor component dung lai
- tach component lon
- thiet ke component API linh hoat hon
- review kien truc component React

Ket luan:

- Nen co, nhung khong phai skill bat buoc cho moi task.

### vercel-react-best-practices

Muc do phu hop: trung binh

Ly do:

- Repo co dung React 19 va Expo Router.
- Tuy nhien skill nay nghieng manh ve React web va Next.js performance.
- Van co gia tri cho mot so nguyen tac React chung, nhung khong nen xem la skill cot loi cua mobile app nay.

Nen dung khi:

- review component React phuc tap
- can tham khao render optimization chung
- muon co them mot lop review ve composition va performance

Khong nen dung khi:

- task Expo-specific
- task React Native platform issue
- task animation, gesture, native API

Ket luan:

- Chua can cai san trong repo nay.

### web-design-guidelines

Muc do phu hop: thap

Ly do:

- Skill nay tap trung vao web UI, HTML semantics, accessibility web, URL state, dark-mode meta va image behavior tren web.
- Repo nay la mobile app React Native.

Ket luan:

- Khong nen cai.

### vercel-react-view-transitions

Muc do phu hop: rat thap

Ly do:

- Skill nay xoay quanh React View Transition API va Next.js integration.
- Khong phu hop voi Expo/React Native.

Ket luan:

- Khong nen cai.

### deploy-to-vercel

Muc do phu hop: rat thap

Ly do:

- Skill nay de deploy web app len Vercel.
- `sociedu-mobile` khong co nhu cau runtime chinh tren Vercel.

Ket luan:

- Khong nen cai.

### vercel-cli-with-tokens

Muc do phu hop: rat thap

Ly do:

- Skill nay huong toi thao tac Vercel CLI co token va luong deployment.
- Repo nay hien tai khong dat trong boi canh van hanh Vercel.

Ket luan:

- Khong nen cai.

## Nguyen tac uu tien

Thu tu uu tien khi co nhieu nguon huong dan:

1. `AGENTS.md`
2. `.agent/instruction.md`
3. `.agent/mandatory-reading.md`
4. `.agent/skill.md`
5. skill trong `.agents/skills/`

Neu co xung dot giua skill ngoai va tai lieu noi bo, uu tien quy uoc trong repo nay.

## Cach su dung toi uu

- Khong mo tat ca skill ngoai truoc moi task.
- Chi dua den `vercel-react-native-skills` khi task thuoc React Native/Expo/mobile performance.
- Chi dua den `vercel-composition-patterns` khi task la refactor component, API component, compound component hoac prop design.
- Giu `.agent` la nguon su that chinh cho quy trinh du an.
