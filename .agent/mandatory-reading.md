# Mandatory Reading

Checklist nay xac dinh cac file phai doc truoc khi viet code. Muc tieu la doc dung file, khong doc luot ca repo.

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
- `src/features/auth/store/authStore.ts`
- `src/features/auth/services/authService.ts`
- `src/core/api.ts`
- `src/components/ProtectedRoute.tsx`

Neu sua trang auth, doc them:

- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/welcome.tsx`
- `src/features/auth/screens/LoginScreen.tsx`
- `src/features/auth/screens/RegisterScreen.tsx`
- `src/features/auth/screens/WelcomeScreen.tsx`
- `src/features/auth/adapters/authAdapter.ts`
- `src/core/types.ts`

## 3. Neu sua home, tab hoac dieu huong chinh

Phai doc:

- `app/(tabs)/_layout.tsx`
- route entry dang sua trong `app/(tabs)/...`
- feature screen tuong ung trong `src/features/.../screens/`
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `docs/ARCHITECTURE.md`

## 4. Neu sua mentor flow

Phai doc:

- `app/(tabs)/mentor.tsx`
- `app/mentor/[id].tsx`
- `app/mentor/dashboard.tsx`
- `src/features/mentor/screens/MentorListScreen.tsx`
- `src/features/mentor/screens/MentorDetailScreen.tsx`
- `src/features/mentor/screens/MentorDashboardScreen.tsx`
- `src/features/mentor/services/mentorService.ts`
- `src/features/mentor/adapters/mentorAdapter.ts`
- `src/features/profile/services/userService.ts`
- `src/core/types.ts`

## 5. Neu sua booking flow hoac payment

Phai doc:

- `app/(tabs)/bookings.tsx`
- `app/booking/[id].tsx`
- `src/features/booking/screens/BookingListScreen.tsx`
- `src/features/booking/screens/BookingDetailScreen.tsx`
- `src/features/booking/store/bookingStore.ts`
- `src/features/booking/services/bookingService.ts`
- `src/features/booking/services/orderService.ts`
- `src/features/booking/adapters/bookingAdapter.ts`
- `src/core/types.ts`

## 6. Neu sua profile hoac user data

Phai doc:

- `app/(tabs)/profile.tsx`
- `app/profile/[id].tsx`
- `app/profile/edit.tsx`
- `src/features/profile/screens/MyProfileScreen.tsx`
- `src/features/profile/screens/PublicProfileScreen.tsx`
- `src/features/profile/screens/EditProfileScreen.tsx`
- `src/features/profile/services/userService.ts`
- `src/features/profile/adapters/userAdapter.ts`
- `src/core/types.ts`

## 7. Neu sua message/chat flow

Phai doc:

- `app/(tabs)/messages.tsx`
- `app/messages/[id].tsx`
- `src/features/message/screens/MessageListScreen.tsx`
- `src/features/message/screens/MessageDetailScreen.tsx`
- `src/features/message/services/chatService.ts`
- `src/core/mocks/chatMocks.ts`
- `src/core/types.ts`

## 8. Neu sua admin

Phai doc:

- `app/admin/index.tsx`
- `src/features/admin/screens/AdminDashboardScreen.tsx`
- `src/components/ProtectedRoute.tsx`

## 9. Neu sua UI component hoac design system

Phai doc:

- component dang sua trong `src/components/`
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `src/theme/breakpoints.ts`
- `docs/ARCHITECTURE.md`

Neu component co file responsive di kem thi doc them:

- `src/components/button/buttonResponsive.ts`
- `src/components/form/textInputResponsive.ts`
- `src/components/ui/cardResponsive.ts`
- `src/components/ui/sectionResponsive.ts`
- `src/components/typography/typographyResponsive.ts`

## 10. Neu sua service, adapter, store hoac API layer

Phai doc:

- `src/core/api.ts`
- `src/core/config.ts`
- feature service/store/adapter dang sua trong `src/features/...`
- wrapper lien quan trong `src/core/...` neu task noi theo wrapper
- `src/core/types.ts`

Neu domain dang co mock, doc them file lien quan trong:

- `src/core/mocks/api/`
- `src/core/mocks/data/`
- `src/core/mocks/chatMocks.ts`

## 11. Neu sua kien truc, quy chuan hoac tai lieu

Phai doc:

- `SYSTEM.md`
- `docs/ARCHITECTURE.md`
- `.agent/project-context.md`
- `.agent/workflows.md`
- `.agent/instruction.md`
- `.agent/skill.md`

## 12. Neu them file moi

Truoc khi them file moi, tu kiem tra:

- Co file hien co nao gan de mo rong khong
- File moi thuoc `app/`, `src/features/`, `src/components/`, `src/core/`, `src/theme/` hay `docs/`
- Ten file da dung convention chua
- File moi co lam trung trach nhiem voi file khac khong

## 13. Dieu kien duoc phep bat dau code

Chi bat dau viet code khi:

- da doc nhom file bat buoc theo loai task
- da xac dinh source of truth
- da biet cach verify thay doi
- da biet file nao khong nen dung vao
