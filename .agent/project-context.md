# Project Context

## Stack hien tai

- Expo `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- Zustand cho shared state
- Axios cho HTTP client
- Expo SecureStore cho access/refresh token
- AsyncStorage cho cached user non-sensitive
- TypeScript `strict`

## Cau truc thu muc hien tai

### `app/`

- Chua route theo file cua Expo Router.
- Uu tien route wiring/layout/redirect, khong dat business logic nang.
- Nhieu file chi `export { default }` sang `src/features/.../screens/...`.

Route hien co:

- `(auth)`: `welcome`, `login`, `register`, `forgot-password`, `otp`, `reset-password`
- `(tabs)`: `index`, `mentor`, `messages`, `bookings`, `profile`
- ngoai tabs: `admin`, `booking/[id]`, `booking/payment-result`, `mentor/[id]`, `mentor/dashboard`, `mentor/services`, `mentor/services/form`, `messages/[id]`, `package/[id]`, `profile/[id]`, `profile/edit`

### `src/features/`

Source of truth theo domain:

- `admin`: moderation dashboard va service approve/reject mentor
- `auth`: screens, service, adapter, store
- `booking`: list/detail/package/payment result, services, adapter, store
- `home`: home tab
- `mentor`: list/detail/dashboard/services, paginated listing service
- `message`: message screens, backend/mock-aware chat service
- `profile`: profile screens, service, adapter

### `src/core/`

- `api.ts`: Axios instance, SecureStore token helpers, refresh flow, session-expired bridge, sanitized errors
- `config.ts`: env-based `API_BASE_URL` va `USE_MOCK`
- `types.ts`: shared DTO va mobile model
- `mocks/`: mock API va mock data
- `services/`, `store/`, `adapters/`: compatibility wrappers

## Luong auth hien tai

1. App mo len o `app/_layout.tsx`.
2. `useAuthStore().hydrate()` doc cached user tu AsyncStorage.
3. Access/refresh token nam trong SecureStore.
4. Guest bi redirect ve `/(auth)/login`; logged-in user khong o lai auth screens.
5. API gap `401` se thu refresh mot lan.
6. Refresh fail se clear token/cache va goi `expireSession()` de UI logout ngay.

## Config va mock

- Env moi: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_USE_MOCK`.
- Production fail-fast neu API URL thieu, khong HTTPS, hoac mock dang bat.
- Mock mode van dung cho local demo, nhung khong duoc coi la security boundary.

## Diem can chu y khi sua code

- Client `ProtectedRoute` chi la UX guard; backend phai enforce role/ownership.
- Payment checkout can slot id va payment result verification tu backend.
- Mentor listing backend nen tra mentor card DTO da gom profile fields, tranh N+1.
- Chat service co backend contract, nhung ownership permission van la trach nhiem backend.
- Wrappers trong `src/core/*` can duoc giu de tranh gay import cu.

## Kiem tra toi thieu

- `npm run typecheck`
- `npm run lint`
- Neu sua auth: smoke guest/logged-in/refresh fail.
- Neu sua payment: smoke no-slot, checkout, payment result paid/pending/cancelled.
- Neu sua admin/message: smoke role guard, approve/reject, message send rollback.
