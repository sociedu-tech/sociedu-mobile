# sociedu-mobile

Ung dung mobile cua Sociedu, duoc xay dung bang Expo, React Native va Expo Router.

## Stack

- Expo `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- Zustand
- Axios
- AsyncStorage
- TypeScript `strict`

## Kien truc nhanh

- `app/`: route entry va layout cua Expo Router
- `src/features/`: source of truth theo domain
- `src/components/`: UI dung chung toan app
- `src/core/`: API layer, mocks, types va compatibility wrappers
- `src/theme/`: theme tokens va responsive utilities

Feature hien co:

- `admin`
- `auth`
- `booking`
- `home`
- `mentor`
- `message`
- `profile`

## Auth flow

- Root guard nam o `app/_layout.tsx`
- App hydrate session tu `src/features/auth/store/authStore.ts`
- Chua dang nhap se bi redirect ve `/(auth)/login`
- Da dang nhap se khong duoc o lai auth screens
- `ProtectedRoute` duoc dung cho man protected va role-based access

## Chay du an

```bash
npm install
npm run start
```

De noi backend that:

```bash
copy .env.example .env
```

Mac dinh file mau dang tro toi `http://localhost:9992`, phu hop voi cau hinh backend local hien tai.

Lenh khac:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Quy uoc code

- Khong goi API truc tiep trong screen
- Uu tien dat logic o `src/features/<feature>`
- Route trong `app/` nen giu mong
- UI phai bam `src/theme/theme.ts` va `src/theme/responsiveUtils.ts`
- Neu can doi kien truc hoac quy trinh, cap nhat `.agent/` va `docs/`

## Tai lieu can doc

- `AGENTS.md`
- `SYSTEM.md`
- `.agent/instruction.md`
- `.agent/mandatory-reading.md`
- `.agent/skill.md`
- `docs/ARCHITECTURE.md`
