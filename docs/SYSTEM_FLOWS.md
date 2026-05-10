# System Flows / Luong he thong

## Muc dich / Purpose

Tai lieu nay mo ta cac luong nghiep vu chinh cua Mentor Marketplace o muc he thong, dong thoi danh dau phan nao da thay dau vet trong mobile app va phan nao moi o muc ky vong.

## Doi tuong doc / Audience

- Product, BA, QA.
- Developers can doi chieu flow nghiep vu voi implementation.

## Nguon tham chieu / Sources

- `SYSTEM.md`.
- `PRD_v2_2_Data_Aligned.docx`.
- Route va service hien tai trong repo mobile.

## Noi dung chinh / Main content

### 1. Auth flow / Luong xac thuc

1. User vao app.
2. App hydrate token va user cache tu `AsyncStorage`.
3. Neu chua dang nhap, app dieu huong ve nhom route `(auth)`.
4. User dang nhap hoac dang ky.
5. App luu `accessToken`, `refreshToken` va cached user.
6. Cac request ve sau dinh kem bearer token.
7. Neu gap `401`, interceptor thu refresh token va retry request.

Trang thai implementation:

- Da thay ro trong `src/core/api.ts`, `src/core/services/authService.ts` va route `app/(auth)/*`.
- Email verify, forgot/reset password da co service-level endpoint, nhung chua thay flow UI day du trong route map.

### 2. Mentor discovery flow / Tim mentor

1. Buyer vao marketplace hoac tab mentor.
2. App lay danh sach mentor.
3. User mo trang chi tiet mentor.
4. App co the lay them public profile va package cua mentor.

Trang thai implementation:

- Da thay route `app/(tabs)/mentor.tsx` va `app/mentor/[id].tsx`.
- `mentorService` da mo ta API lay mentor, chi tiet mentor va package.
- Search/filter nang cao chua thay ro la fully implemented.

### 3. Package selection and checkout / Chon goi va thanh toan

1. Buyer xem mentor detail.
2. Buyer chon package version phu hop.
3. App tao order thong qua checkout.
4. He thong tra ve order va thong tin payment.
5. App theo doi trang thai order cho den khi paid hoac cancel.

Trang thai implementation:

- `orderService.checkout`, `getById`, `pollUntilPaid` da co trong code.
- Route `app/package/[id].tsx` va `app/booking/[id].tsx` cho thay app da tinh den flow package va booking detail.
- Payment gateway return va deep link duoc ky vong trong backend config, nhung flow UI payment result chua tach thanh tai lieu rieng.

### 4. Booking and session flow / Luong booking va session

1. Sau payment success, he thong tao booking.
2. Booking co mot hoac nhieu session.
3. Mentor hoac buyer xem booking detail.
4. Mentor cap nhat `status`, `meetingUrl`, `scheduledAt` cho tung session.
5. Evidence co the duoc them vao session.

Trang thai implementation:

- `bookingService` da ho tro buyer bookings, mentor bookings, booking detail, update session, add evidence.
- Co route `app/(tabs)/bookings.tsx` va `app/booking/[id].tsx`.
- Reschedule flow rieng va availability engine chua thay trong code.

### 5. Messaging flow / Luong nhan tin

1. Buyer va mentor co conversation chung hoac conversation gan voi booking.
2. User mo danh sach hoi thoai.
3. User vao chi tiet conversation va gui tin nhan.
4. Attachment va session context co the duoc gan vao conversation.

Trang thai implementation:

- Route `app/(tabs)/messages.tsx` va `app/messages/[id].tsx` da ton tai.
- `chatService` hien dang dung mock data, chua thay API thuc.
- Read receipt, unread count chinh xac va realtime messaging dang la gap so voi vision MVP rong hon.

### 6. Report and dispute flow / Luong report va dispute

1. User gap van de voi user, message, booking hoac session.
2. User tao report va dinh kem evidence neu can.
3. Truong hop can nang cap, he thong tao dispute.
4. Admin xu ly bang status va resolution note.

Trang thai implementation:

- Flow nay duoc mo ta ro trong PRD/SYSTEM.
- Repo mobile hien tai chua cho thay route hoac service tap trung cho report/dispute.
- Nen xem day la `system capability expected`, `not implemented in mobile yet`.

### 7. Progress report flow / Theo doi tien do

1. Mentee hoac system tao progress report.
2. Bao cao gan voi mentor/mentee va co the gan sau session hoac package.
3. Mentor de lai feedback.

Trang thai implementation:

- Co route `app/mentor/progress-reports/*` va `progressReportService` trong `src/core/services/progressReportService.ts`.
- API that su cho progress report can tiep tuc doi chieu voi backend (hien tai service da goi `API_PATHS.progressReports.*`).

## Open questions / Known gaps

- Report/dispute va progress report hien dang la nhung flow nghiep vu quan trong cua he thong nhung chua duoc phan thanh cac module mobile ro rang trong repo nay.
- Messaging dang co UI/route va service layer, nhung service hien tai van la mock-first.
