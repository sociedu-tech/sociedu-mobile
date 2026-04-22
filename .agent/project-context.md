# Project Context

## Stack hien tai

- Expo `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- Zustand cho shared state
- Axios cho HTTP client
- AsyncStorage cho token va user cache
- TypeScript `strict`

## Cau truc thu muc hien tai

### `app/`

- Chua route theo file cua Expo Router
- Da duoc lam mong cho nhieu route
- Uu tien chi route wiring, layout va redirect
- Nhieu file hien chi `export { default }` sang `src/features/.../screens/...`

Route hien co:

- `(auth)`: `welcome`, `login`, `register`
- `(tabs)`: `index`, `mentor`, `messages`, `bookings`, `profile`, `marketplace`
- ngoai tabs: `admin`, `booking/[id]`, `mentor/[id]`, `mentor/dashboard`, `messages/[id]`, `profile/[id]`, `profile/edit`

### `src/features/`

Day la source of truth theo domain. Hien tai da co:

- `admin`
- `auth`
- `booking`
- `home`
- `marketplace`
- `mentor`
- `message`
- `profile`

Thu muc feature co the gom:

- `screens/`
- `services/`
- `store/`
- `adapters/`
- `components/`

### `src/core/`

- `api.ts`: Axios instance, token helpers, interceptors, refresh flow
- `config.ts`: config dung chung, hien co `USE_MOCK`
- `types.ts`: DTO va mobile model chung
- `mocks/`: mock API va mock data
- `services/`, `store/`, `adapters/`: compatibility wrappers re-export sang feature implementations

### `src/components/`

- Shared UI theo nhom `button`, `display`, `form`, `states`, `typography`, `ui`
- Chua cac helper responsive di kem component

### `src/theme/`

- Theme tokens
- Breakpoints
- Responsive utilities
- Hook `useBreakpoint`

## Luong auth hien tai

1. App mo len o `app/_layout.tsx`
2. `useAuthStore().hydrate()` doc user cache tu AsyncStorage
3. Neu da dang nhap, route trong `(auth)` bi day sang `(tabs)`
4. Neu chua dang nhap, route ngoai `(auth)` bi redirect ve `/(auth)/login`
5. Neu API tra `401`, `src/core/api.ts` thu refresh token 1 lan truoc khi clear session

## Trang thai feature hien tai

### Hoan chinh tuong doi

- `auth`
- `mentor`
- `booking`
- `profile`
- `message`
- `home`

### Skeleton hoac placeholder

- `admin`: protected skeleton screen
- `marketplace`: placeholder list/detail screens, chua co service/store rieng

## Diem can chu y khi sua code

- `API_BASE_URL` dang hard-code theo IP LAN trong `src/core/api.ts`
- `USE_MOCK` hien dang `false`
- Chat service hien van mock-first
- `src/core/*` wrappers can duoc giu de tranh gay import cu
- Co mot so file cu con comment/chuoi bi lech encoding, nen sua co kiem soat
- Lint script hien tai la `npm run lint` -> `eslint .`

## Vung uu tien khi them hoac sua feature

- Route entry: `app/`
- Logic man hinh: `src/features/<feature>/screens/`
- Logic goi API: `src/features/<feature>/services/`
- Chuan hoa du lieu: `src/features/<feature>/adapters/`
- Shared state cua feature: `src/features/<feature>/store/`
- UI tai su dung toan app: `src/components/`
- Ha tang chung va wrappers: `src/core/`
