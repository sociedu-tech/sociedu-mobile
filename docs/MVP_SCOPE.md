# MVP Scope / Pham vi MVP

## Muc dich / Purpose

Tai lieu nay khoa lai pham vi MVP theo huong `data-aligned`, de team khong hieu nham giua vision day du cua san pham va nhung nang luc schema/data model hien tai co the ho tro.

## Doi tuong doc / Audience

- Product, BA, QA.
- Mobile/backend developers can align implementation priority.

## Nguon tham chieu / Sources

- `PRD_v2_2_Data_Aligned.docx`.
- `SYSTEM.md`.

## Noi dung chinh / Main content

### 1. MVP statement

MVP hien tai nen duoc hieu la:

> Mentor Marketplace co package curriculum, order/payment, booking session, chat, report/dispute va progress report.

### 2. In-scope / Trong pham vi MVP

| Nhom chuc nang | Nang luc duoc xem la data-supported |
| --- | --- |
| Identity & Access | Dang ky, dang nhap, refresh token, OTP token, user status, role, capability |
| User Profile | Ho so co ban, ngon ngu, hoc van, kinh nghiem, chung chi |
| Mentor Profile | Headline, expertise dang text, base price, rating average, sessions completed, verification status |
| Service Package | Package, package version, curriculum/module |
| Order & Payment | Order, payment transaction, provider response |
| Booking | Booking gan buyer, mentor, package version va order |
| Booking Session | Nhieu session trong mot booking, meeting URL, evidence |
| Messaging | Conversation, participant, message, attachment |
| Report | Report theo entity type, report evidence |
| Dispute | Dispute gan report, booking hoac session |
| File | Metadata file dung chung cho avatar, certificate, evidence, attachment |
| Progress Report | Mentee progress report, mentor feedback |

### 3. Manual MVP / Future phase

| Nang luc | Trang thai |
| --- | --- |
| Availability calendar chuan | Future phase hoac can migration |
| Slot locking / double-booking prevention | Chua supported bang DB hien tai |
| Escrow ledger | Manual MVP / logical operation |
| Payout ledger | Future phase |
| Refund transaction rieng | Future phase |
| Review system va moderation review | Future phase |
| Notification center | Future phase |
| Message read receipt / unread count chinh xac | Future phase |
| Admin audit log day du | Future phase |
| Analytics event tracking | Future phase |
| Fee / refund / verification rule config | Future phase |
| Expertise category normalized | Future phase |
| Realtime messaging bat buoc | Khong bat buoc trong MVP |
| Reschedule flow rieng | Future phase |

### 4. Acceptance criteria cap he thong

- User co the dang ky, dang nhap, refresh token va thuc hien cac flow xac thuc lien quan.
- User co the cap nhat profile, hoc van, kinh nghiem, ngon ngu va chung chi.
- Mentor co the tao mentor profile, service package, package version va curriculum.
- Buyer co the tao order tu package version va he thong co the ghi nhan payment transaction.
- Sau payment success, he thong co the tao booking va booking sessions.
- Buyer va mentor co the trao doi qua conversation.
- User co the tao report/dispute va admin co the xu ly bang status va resolution note.
- He thong co file metadata tap trung va co co che evidence.

### 5. Cach doc pham vi nay trong repo mobile

- `In-scope` khong dong nghia voi `da implement day du trong app`.
- `Data-supported` nghia la schema hien tai co co so de xay, nhung UI, API hoac app mobile co the van chua hoan tat.
- Cac chenh lech giua pham vi MVP va implementation thuc te duoc tong hop trong `KNOWN_GAPS.md`.

## Open questions / Known gaps

- PRD v2.2 mo ta module `progress report`, `report/dispute`, `messaging` ro o muc he thong, nhung app mobile hien tai chua cho thay day du luong API thuc cho tat ca cac module nay.
