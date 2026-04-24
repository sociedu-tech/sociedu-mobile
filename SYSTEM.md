# Unishare Mobile - System Overview

Tai lieu tong quan he thong cho `sociedu-mobile`. Doc file nay truoc khi lam task neu can hieu bai toan nghiep vu va cac actor chinh.

## 1. San pham nay la gi

Ung dung mobile nay phuc vu nen tang ket noi nguoi hoc voi mentor. Tren mobile, nguoi dung co the:

- dang ky va dang nhap
- kham pha mentor
- xem profile cong khai
- xem bookings va session
- nhan tin
- quan ly profile cua minh
- vao mentor dashboard hoac admin dashboard theo role

Mobile app khong chua business rule backend day du. Trach nhiem chinh cua app la:

- dieu huong dung flow theo auth va role
- goi API qua service layer
- map DTO sang UI model qua adapter
- giu state man hinh va session on dinh
- render UI bam theme va responsive system

## 2. Actor trong app

| Actor | Vai tro trong mobile |
| --- | --- |
| `guest` | Chua dang nhap, chi di duoc auth flow |
| `user` | Mentee mac dinh, xem mentor, dat lich, chat, quan ly profile |
| `mentor` | Co them mentor dashboard va booking flow cho mentor |
| `admin` | Duoc vao admin dashboard qua role guard |

Nguon role hien tai di qua `authStore` va `ProtectedRoute`.

## 3. Module hien co trong codebase

| Module | Trang thai |
| --- | --- |
| `auth` | Hoan chinh co screen, service, adapter, store |
| `home` | Hero/home tab cho user |
| `mentor` | List, detail, dashboard, service, adapter, components |
| `booking` | List, detail, store, service, adapter, components |
| `profile` | My profile, public profile, edit profile, service, adapter |
| `message` | Message list, detail, mock-first chat service |
| `admin` | Skeleton protected screen |

## 4. Luong he thong quan trong

### Auth va route guard

1. App mo len o `app/_layout.tsx`
2. `useAuthStore().hydrate()` doc user cache tu AsyncStorage
3. Neu chua dang nhap, route ngoai `(auth)` se bi redirect ve `/(auth)/login`
4. Neu da dang nhap, route trong `(auth)` se bi redirect ve `/(tabs)`
5. Route protected hoac role-specific dung `src/components/ProtectedRoute.tsx`

### API va session

- `src/core/api.ts` la noi cau hinh Axios instance
- Request interceptor tu gan bearer token
- Response interceptor thu refresh token mot lan khi gap `401`
- Session expired se clear token va user cache
- `src/core/config.ts` dieu khien mock mode bang `USE_MOCK`

### Feature flow hien tai

- `home` dan nguoi dung sang mentor list
- `mentor` lay danh sach mentor, ghep profile cong khai qua `userService`
- `booking` doi hanh vi giua buyer va mentor dua tren `userRole`
- `profile` load `getMe()`, cho phep logout, edit, vao dashboard theo role
- `message` hien tai dung mock data va local in-memory updates
- `admin` hien la skeleton, nhung da o dung kien truc

## 5. Kien truc thu muc thuc te

```text
app/
  (auth)/
  (tabs)/
  admin/
  booking/
  mentor/
  messages/
  profile/

src/
  components/
  core/
    adapters/
    mocks/
    services/
    store/
    api.ts
    config.ts
    types.ts
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

## 6. Rule kien truc quan trong

- `app/` la route layer, khong phai noi de dat business logic nang
- `src/features/` la source of truth theo domain
- `src/core/` chu yeu cho ha tang chung va compatibility wrappers
- `src/components/` chi chua UI dung lai toan app
- `src/theme/` la nguon token va responsive utilities
- Screen khong goi `axios` truc tiep
- Bien doi shape du lieu backend nen o adapter, khong o screen

## 7. Thuc trang can ghi nho

- `API_BASE_URL` dang hard-code theo IP LAN trong `src/core/api.ts`
- `USE_MOCK` hien dang `false`
- Chat van mock-first
- Admin dashboard van la skeleton
- Lint script hien tai la `eslint .`

## 8. Muc tieu cua moi thay doi

Mot thay doi duoc xem la dung khi:

- giai quyet dung van de nghiep vu hoac ky thuat
- giu on dinh auth flow va role guard
- dat dung layer trong kien truc hien tai
- khong tao source of truth kep
- khong bo qua theme va responsive system
- co cach verify ro rang, toi thieu bang `npm run lint`
