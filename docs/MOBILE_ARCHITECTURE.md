# Mobile Architecture / Kien truc mobile

## Muc dich / Purpose

Tai lieu nay mo ta implementation thuc te cua app `sociedu-mobile`: tech stack, routing, state management, service layer va nguyen tac mo rong code.

## Doi tuong doc / Audience

- Mobile developers.
- Tech lead / mentor review codebase.
- Backend developers can hieu mobile dang to chuc tich hop nhu the nao.

## Nguon tham chieu / Sources

- `package.json`.
- Thu muc `app/`.
- Thu muc `src/`.

## Noi dung chinh / Main content

### 1. Tech stack

| Thanh phan | Cong nghe hien tai |
| --- | --- |
| Mobile framework | React Native 0.81 + Expo 54 |
| Router | Expo Router |
| State management | Zustand |
| Local persistence | AsyncStorage |
| Networking | Axios + interceptors |
| Language | TypeScript |
| UI foundation | React Native components + custom component library trong `src/components` |

### 2. Kien truc tong quan

App duoc tach thanh hai lop chinh:

- `app/`: routing layer, chua route va screen-level composition.
- `src/`: core implementation, gom services, adapters, stores, theme va shared components.

Dieu nay giup route map va business logic tach tuong doi ro nhau:

- Route nam o `app/*`.
- API/service nam o `src/core/services/*`.
- Chuyen doi DTO sang app model nam o `src/core/adapters/*`.
- Auth/session state nam o `src/core/store/*`.
- Design primitives nam o `src/components/*` va `src/theme/*`.

### 3. Routing structure

#### Auth routes

- `app/(auth)/welcome.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/otp.tsx`

#### Main tabs

- `app/(tabs)/index.tsx`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/mentor.tsx`
- `app/(tabs)/bookings.tsx`
- `app/(tabs)/messages.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/marketplace/*`

#### Standalone/detail flows

- `app/booking/[id].tsx`
- `app/messages/[id].tsx`
- `app/package/[id].tsx`
- `app/profile/[id].tsx`
- `app/profile/edit.tsx`
- `app/mentor/[id].tsx`
- `app/mentor/dashboard.tsx`
- `app/mentor/services/index.tsx`
- `app/mentor/services/form.tsx`
- `app/admin/index.tsx`

### 4. State management va session handling

- Auth token duoc luu bang `AsyncStorage`.
- `src/core/api.ts` cau hinh `api` instance va request/response interceptors.
- Request interceptor tu dong gan `Authorization: Bearer <token>`.
- Response interceptor xu ly `401`, goi refresh token, retry request dang cho.
- Token duoc luu bang `tokenStorage`; user cache luu o `STORAGE_KEYS.USER`.

Y nghia kien truc:

- Phan lon man hinh khong can tu quan ly token.
- Session expiry duoc xu ly tap trung.
- Backend contract phai giu response shape on dinh cho auth refresh.

### 5. Service layer

#### Auth

- `authService`: login, register, logout, refresh, forgot/reset password, verify email, resend verification.

#### User profile

- `userService`: get/update profile, CRUD cho education, experience, language, certificate.

#### Mentor va package

- `mentorService`: lay danh sach mentor, chi tiet mentor, package, update mentor profile, CRUD co ban cho package/curriculum.

#### Orders va booking

- `orderService`: checkout, get order, poll payment status.
- `bookingService`: get bookings, get booking detail, update session, add evidence.

#### Messaging

- `chatService`: hien dang la mock service cho conversation/messages/session context.

### 6. Adapters va data normalization

Thu muc `src/core/adapters` chua cac ham map DTO sang app-facing models:

- `authAdapter.ts`
- `bookingAdapter.ts`
- `mentorAdapter.ts`
- `userAdapter.ts`

Day la lop quan trong de:

- Tach contract backend khoi UI.
- Cho phep doi response naming ma khong lan code o nhieu man hinh.
- Han che rework neu backend dieu chinh field shape.

### 7. Shared UI va theme system

`src/components` duoc to chuc theo nhom:

- `button`
- `display`
- `form`
- `states`
- `typography`
- `ui`

`src/theme` chua:

- `theme.ts`
- `breakpoints.ts`
- `responsiveUtils.ts`
- `useBreakpoint.ts`

Dieu nay cho thay app dang huong toi mot design system nho, thay vi viet UI hoan toan inline trong tung screen.

### 8. Mock-first implementation

Codebase hien tai co co che `USE_MOCK` va cac mock API trong `src/core/mocks`.

Tac dong thuc te:

- Mot so flow co the duoc demo du giao tiep backend chua hoan tat.
- Docs va QA can phan biet ro `implemented with real API` va `implemented with mock data`.
- Messaging la vi du ro nhat cua module hien tai van mock-first.

## Open questions / Known gaps

- Kien truc route da rong hon phan service thuc te; khong phai man hinh nao cung co API implementation day du.
- Trong source van con dau vet ten `UniShare`; bo docs nay thong nhat theo ten `SocieDu Mobile`.
