# Unishare Mobile - System Overview

Tai lieu tong quan he thong cho `sociedu-mobile`.

## 1. San pham nay la gi

Ung dung mobile phuc vu nen tang ket noi nguoi hoc voi mentor. Tren mobile, nguoi dung co the:

- dang ky, dang nhap, khoi phuc mat khau
- kham pha mentor va goi hoc
- chon slot, checkout, xem ket qua thanh toan
- xem bookings va session
- nhan tin
- quan ly profile
- vao mentor dashboard hoac admin dashboard theo role

Mobile app khong thay the backend business rules. App chiu trach nhiem dieu huong, goi API qua service, map DTO qua adapter, giu session/UI state on dinh va render UI theo theme/responsive system.

## 2. Actor trong app

| Actor | Vai tro trong mobile |
| --- | --- |
| `guest` | Chua dang nhap, chi di duoc auth flow |
| `user` | Xem mentor, dat lich, chat, quan ly profile |
| `mentor` | Co them mentor dashboard va service management khi da verified |
| `admin` | Vao admin moderation dashboard |

Client role guard chi phuc vu UX navigation. Backend bat buoc enforce role, ownership, payment verification va permission.

## 3. Module hien co

| Module | Trang thai |
| --- | --- |
| `auth` | Auth flow, SecureStore token, cached user hydrate, session expiry |
| `home` | Home tab |
| `mentor` | List/detail/dashboard/services, paginated listing contract |
| `booking` | Booking list/detail, package checkout voi slot, payment result verification |
| `profile` | My profile, public profile, edit profile |
| `message` | Message list/detail, backend/mock-aware chat service |
| `admin` | Protected moderation dashboard, mentor approve/reject, audit fallback |

## 4. Luong he thong quan trong

### Auth va route guard

1. `app/_layout.tsx` hydrate auth state.
2. User cache doc tu AsyncStorage; token doc tu SecureStore.
3. Guest bi redirect ve `/(auth)/login`.
4. Logged-in user bi redirect khoi auth screens.
5. Role-specific route dung `ProtectedRoute`.
6. Refresh token fail se clear storage va `expireSession()` de UI logout ngay.

### API va config

- `src/core/config.ts` doc `EXPO_PUBLIC_API_BASE_URL` va `EXPO_PUBLIC_USE_MOCK`.
- Production fail-fast neu thieu API URL, API URL khong HTTPS, hoac mock dang bat.
- `src/core/api.ts` cau hinh Axios, bearer token, refresh queue, sanitized error messages.

### Feature flow

- `mentorService.getAll(query)` tra paginated result; backend nen gom profile fields trong mentor card DTO.
- Package checkout bat buoc co `slotId`; `/booking/payment-result` verify order status tu backend.
- Admin service co queue approve/reject mentor va audit log fallback.
- Chat service ho tro mock/backend, pagination, mark-read, optimistic send rollback va report hook.

## 5. Kien truc thu muc

```text
app/
  (auth)/
  (tabs)/
  admin/
  booking/
  mentor/
  messages/
  package/
  profile/

src/
  components/
  core/
  features/
    admin/
    auth/
    booking/
    home/
    mentor/
    message/
    profile/
  theme/
```

## 6. Muc tieu cua moi thay doi

Mot thay doi duoc xem la dung khi:

- giai quyet dung yeu cau nghiep vu/ky thuat
- giu `app/` mong va logic trong feature dung domain
- khong pha auth flow, role guard, payment verification assumptions
- khong goi API truc tiep trong screen
- khong luu token trong AsyncStorage
- co verify bang `npm run typecheck` va `npm run lint`
