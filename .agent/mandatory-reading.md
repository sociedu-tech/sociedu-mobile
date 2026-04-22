# Mandatory Reading

Checklist nay xac dinh cac file phai doc truoc khi viet code. Khong doc luot toan repo; chi doc dung nhom file lien quan de giu context sach nhung du.

## 1. Moi task deu phai doc

- `AGENTS.md`
- `.agent/instruction.md`
- `.agent/mandatory-reading.md`
- `.agent/skill.md`
- `package.json`
- `tsconfig.json`

## 2. Neu sua routing hoac auth

Phai doc:

- `app/_layout.tsx`
- `app/(auth)/_layout.tsx`
- `src/core/store/authStore.ts`
- `src/core/services/authService.ts`
- `src/core/api.ts`
- `src/components/ProtectedRoute.tsx`

Doc them neu sua trang auth:

- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `src/core/adapters/authAdapter.ts`
- `src/core/types.ts`

## 3. Neu sua tab, man hinh nguoi dung hoac dieu huong chinh

Phai doc:

- `app/(tabs)/_layout.tsx`
- screen dang sua trong `app/(tabs)/...`
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `docs/ARCHITECTURE.md`

## 4. Neu sua booking flow

Phai doc:

- `app/(tabs)/bookings.tsx`
- `app/booking/[id].tsx`
- `src/core/store/bookingStore.ts`
- `src/core/services/bookingService.ts`
- `src/core/adapters/bookingAdapter.ts`
- `src/core/types.ts`

## 5. Neu sua mentor, profile, user data

Phai doc:

- screen dang sua
- `src/core/services/mentorService.ts` hoac `src/core/services/userService.ts`
- adapter tuong ung trong `src/core/adapters/`
- `src/core/types.ts`

## 6. Neu sua UI component hoac design system

Phai doc:

- component dang sua trong `src/components/`
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `src/theme/breakpoints.ts`
- `docs/ARCHITECTURE.md`

Neu component co file responsive di kem thi doc ca file do, vi du:

- `src/components/button/buttonResponsive.ts`
- `src/components/ui/cardResponsive.ts`
- `src/components/ui/sectionResponsive.ts`
- `src/components/form/textInputResponsive.ts`
- `src/components/typography/typographyResponsive.ts`

## 7. Neu sua service, adapter hoac API layer

Phai doc:

- `src/core/api.ts`
- `src/core/config.ts`
- service dang sua
- adapter lien quan
- `src/core/types.ts`

Neu repo dang chay mock cho domain do thi doc them:

- file trong `src/core/mocks/api/`
- file du lieu lien quan trong `src/core/mocks/data/`

## 8. Neu sua kien truc, quy chuan hoac cach lam viec

Phai doc:

- `docs/ARCHITECTURE.md`
- `.agent/project-context.md`
- `.agent/workflows.md`
- `.agent/instruction.md`
- `.agent/skill.md`

## 9. Neu them file moi

Truoc khi them file moi, phai tu kiem tra:

- Co file hien co nao du gan de mo rong khong
- File moi thuoc `app/`, `src/core/`, `src/components/`, `src/theme/` hay `docs/`
- Ten file da dung convention chua
- File moi co lam trung trach nhiem voi file khac khong

## 10. Dieu kien duoc phep bat dau code

Chi bat dau viet code khi:

- da doc nhom file bat buoc theo loai task
- da xac dinh source of truth
- da biet cach verify thay doi
- da biet file nao khong nen dung vao
