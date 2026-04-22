# Project Context

## Stack hien tai

- Expo `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- Zustand cho state chia se
- Axios cho HTTP client
- AsyncStorage cho token va user cache

## Cau truc thu muc hien tai

### `app/`

- Chua route theo file cua Expo Router.
- Da duoc lam mong cho nhieu route.
- Uu tien chi route wiring, layout va redirect.
- Nhieu file trong `app/` hien chi `export { default }` sang `src/features/.../screens/...`

### `src/features/`

Day la source of truth theo domain. Hien tai da co:

- `auth/`
- `booking/`
- `home/`
- `mentor/`
- `message/`
- `profile/`

Moi feature co the gom:

- `screens/`
- `services/`
- `store/`
- `adapters/`
- `components/`

### `src/core/`

- `api.ts`: axios instance, interceptor, refresh token flow, storage keys
- `config.ts`: config dung chung, dang bat mock API toan cuc
- `mocks/`: mock API va mock data
- `services/`, `store/`, `adapters/`: nhieu file hien la compatibility wrapper sang `src/features/`

### `src/components/`

- Component dung chung theo nhom `button`, `form`, `ui`, `states`, `typography`
- Day la shared UI layer, khong phai noi uu tien de dat component chi dung trong 1 feature

### `src/theme/`

- Theme token, breakpoint va responsive utilities

## Luong auth hien tai

1. App mo len, `app/_layout.tsx` goi `useAuthStore().hydrate()`
2. `src/features/auth/services/authService.ts` doc user da luu
3. Neu da dang nhap, route se bi day khoi `(auth)` sang `(tabs)`
4. Neu chua dang nhap, truy cap route ngoai `(auth)` se bi redirect ve `/(auth)/login`
5. Neu API tra `401`, `src/core/api.ts` se thu refresh token mot lan truoc khi clear session

## Trang thai refactor hien tai

Da tach xong cac feature chinh:

- `auth`
- `mentor`
- `booking`
- `profile`
- `message`
- `home`
- `admin`
- `marketplace`

Da clean `npm run lint`.

Chua tach hoac chua chuan hoa day du:

- mot so route phu, route demo hoac route dev neu phat sinh trong tuong lai
- tai lieu `docs/` co the chua cap nhat het theo feature-based structure

## Diem can chu y khi sua code

- `API_BASE_URL` dang hard-code theo IP mang LAN trong `src/core/api.ts`
- Repo con giu ca `components/` mac dinh tu starter Expo va `src/components/` do du an tu xay
- Neu sua UI, xac minh dang dung `src/components/` thay vi `components/` starter
- Kiem tra ky file co encoding cu neu sua file cu chua duoc refactor
- Kiem tra chinh hien tai la `npm run lint`

## Vung uu tien khi feature moi

- Route entry: them trong `app/`
- Logic man hinh: them trong `src/features/<feature>/screens/`
- Logic goi API: them trong `src/features/<feature>/services/`
- Chuan hoa du lieu: them hoac sua trong `src/features/<feature>/adapters/`
- State chia se: them trong `src/features/<feature>/store/`
- UI tai su dung toan app: `src/components/`
