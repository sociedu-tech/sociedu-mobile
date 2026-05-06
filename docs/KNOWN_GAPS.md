# Known Gaps / Chenh lech hien tai

## Muc dich / Purpose

Tai lieu nay tong hop nhung chenh lech quan trong giua vision san pham, pham vi MVP data-aligned va implementation mobile hien tai. Day la noi uu tien de Product, Engineering va QA giam nham lan.

## Doi tuong doc / Audience

- Product, BA, QA.
- Mobile/backend developers.
- Mentor/lead can lap backlog.

## Nguon tham chieu / Sources

- `PRODUCT_OVERVIEW.md`
- `MVP_SCOPE.md`
- `SYSTEM_FLOWS.md`
- Codebase hien tai

## Noi dung chinh / Main content

### 1. Product vision vs mobile implementation

- Vision MVP theo PRD v2.2 bao gom messaging, report/dispute, progress report va booking session day du.
- Mobile app hien da co route cho auth, discovery, mentor, package, booking, messages, profile, admin.
- Tuy nhien, khong phai module nao trong route map cung da co real API hoac flow hoan chinh.

### 2. Real API vs mock implementation

- `chatService` hien dang su dung mock data cho conversation, message va session context.
- Codebase co `USE_MOCK`, nghia la mot so flow co the demo du backend chua hoan tat.
- Tai lieu va QA can tranh danh dong `co man hinh` voi `da tich hop backend that`.

### 3. Flows co trong he thong nhung chua ro trong mobile

- Report/dispute: co trong PRD/SYSTEM, chua thay route/service tap trung.
- Progress report: co trong PRD/SYSTEM, chua thay route/service ro rang.
- Notification center: future phase.
- Review/moderation review: future phase.
- Availability slot engine va reschedule flow rieng: chua thay dau vet implementation.

### 4. Route map rong hon feature completeness

- Discovery hien co nhieu diem vao: `explore`, `mentor`, `marketplace`.
- Admin co route rieng, nhung can tiep tuc danh gia muc do hoan thien cua feature.
- Payment result flow va dispute handling state chua duoc the hien thanh module ro rang.

### 5. Contract va naming can thong nhat

- Response wrapper code dang unwrap qua `response.data.data`, trong khi tai lieu tich hop cu mong doi them `code`, `isSuccess`, `message`, `errors`, `timestamp`.
- Order status trong PRD/SYSTEM thuong dung `canceled`, con code `pollUntilPaid` dang kiem tra `cancelled`.
- Ten san pham trong repo va docs cu co luc la `UniShare`, bo docs moi thong nhat la `SocieDu Mobile - Mentor Marketplace App`.

### 6. Tai lieu repo truoc khi viet lai

- `docs` cu chi co 3 file roi rac va chua co trang dieu huong.
- Root `README.md` van la template Expo, chua phan anh ban chat du an.

## Open questions / Known gaps

- Can uu tien chuan hoa discovery UX hay tiep tuc mo rong booking/messaging truoc.
- Can xac nhan lai voi backend ten state chinh thuc, response wrapper va OTP-related endpoints truoc khi khoi dong integration QA day du.
