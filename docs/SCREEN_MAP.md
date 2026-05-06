# Screen Map / Ban do man hinh

## Muc dich / Purpose

Tai lieu nay map module nghiep vu voi route/man hinh hien co trong `app/`, giup team nhanh chong biet app da co gi, man hinh nao la skeleton va luong nao can bo sung.

## Doi tuong doc / Audience

- Mobile developers.
- QA.
- Product/BA can doi chieu scope voi UI hien co.

## Nguon tham chieu / Sources

- Thu muc `app/`.
- `MVP_SCOPE.md`.

## Noi dung chinh / Main content

### 1. Authentication

| Module | Route hien co | Ghi chu |
| --- | --- | --- |
| Welcome | `app/(auth)/welcome.tsx` | Entry screen cho auth flow |
| Login | `app/(auth)/login.tsx` | Co service login thuc |
| Register | `app/(auth)/register.tsx` | Co service register thuc |
| OTP | `app/(auth)/otp.tsx` | Co route, can doi chieu them voi backend OTP flow |

### 2. Buyer core flows

| Module | Route hien co | Ghi chu |
| --- | --- | --- |
| Home | `app/(tabs)/index.tsx` | Trang tong quan trong tab |
| Explore | `app/(tabs)/explore.tsx` | Discovery layer |
| Marketplace listing | `app/(tabs)/marketplace/index.tsx` | Listing mentor/package theo huong marketplace |
| Marketplace detail | `app/(tabs)/marketplace/[id].tsx` | Detail trong nested marketplace flow |
| Mentor listing tab | `app/(tabs)/mentor.tsx` | Co the trung lap muc dich voi marketplace listing |
| Mentor detail | `app/mentor/[id].tsx` | Chi tiet mentor cap route rieng |
| Package detail | `app/package/[id].tsx` | Detail cho package/package version |
| Bookings list | `app/(tabs)/bookings.tsx` | Danh sach booking cua user |
| Booking detail | `app/booking/[id].tsx` | Chi tiet booking/session |
| Messages list | `app/(tabs)/messages.tsx` | Danh sach hoi thoai |
| Message detail | `app/messages/[id].tsx` | Chi tiet conversation |
| Profile tab | `app/(tabs)/profile.tsx` | Profile cua current user |
| Public profile | `app/profile/[id].tsx` | Profile detail theo user id |
| Edit profile | `app/profile/edit.tsx` | Chinh sua profile |

### 3. Mentor flows

| Module | Route hien co | Ghi chu |
| --- | --- | --- |
| Mentor dashboard | `app/mentor/dashboard.tsx` | Skeleton/working area cho mentor |
| Mentor services list | `app/mentor/services/index.tsx` | Quan ly package cua mentor |
| Mentor service form | `app/mentor/services/form.tsx` | Tao/sua dich vu |

### 4. Admin flows

| Module | Route hien co | Ghi chu |
| --- | --- | --- |
| Admin dashboard | `app/admin/index.tsx` | Entry point cho admin UI, can doi chieu them voi feature thật |

### 5. Utility / shared routes

| Module | Route hien co | Ghi chu |
| --- | --- | --- |
| Root entry | `app/index.tsx` | Diem vao mac dinh cua app |
| Root layout | `app/_layout.tsx` | Root navigator va global wrapper |
| Auth layout | `app/(auth)/_layout.tsx` | Auth route grouping |
| Tabs layout | `app/(tabs)/_layout.tsx` | Bottom tab setup |
| Marketplace layout | `app/(tabs)/marketplace/_layout.tsx` | Nested flow cho marketplace |
| Modal | `app/modal.tsx` | Utility modal route |
| UI playground | `app/ui-playground.tsx` | Playground/noi thu nghiem UI |

### 6. Nhan xet tong hop

- Route map hien tai bao phu nhieu phan cua product vision: auth, discovery, mentor, package, booking, messages, profile, admin.
- Co dau hieu ton tai dong thoi nhieu entry cho discovery (`mentor`, `explore`, `marketplace`), can su dung docs khac de lam ro vai tro tung route.
- Chua thay route ro rang cho report/dispute, progress report, payment result, notification center.

## Open questions / Known gaps

- Co the can hop nhat lai `mentor`, `explore` va `marketplace` ve mat san pham de tranh trung lap UX.
- Admin route da co, nhung muc do hoan chinh cua admin flows can tiep tuc doi chieu voi code man hinh thuc te.
