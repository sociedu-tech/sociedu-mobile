# API Contract / Hop dong API

## Muc dich / Purpose

Tai lieu nay tong hop backend contract ma mobile dang ky vong, tach ro gi da xac nhan trong code, gi dang la expectation tu service layer, va gi chua co bang chung implementation day du.

## Doi tuong doc / Audience

- Backend developers.
- Mobile developers.
- QA can lap test matrix tich hop.

## Nguon tham chieu / Sources

- `src/core/backend.ts`
- `src/core/api.ts`
- `src/core/services/*`
- `BACKEND_MOBILE_INTEGRATION.md` cu

## Noi dung chinh / Main content

### 1. Backend snapshot xac nhan tu code

| Muc | Gia tri |
| --- | --- |
| Base URL | lay tu `BACKEND_CONFIG.baseUrl` |
| API prefix | lay tu `BACKEND_CONFIG.apiPrefix` |
| API root | `baseUrl + apiPrefix` |
| Upload field name | lay tu `BACKEND_CONFIG.uploadFieldName` |
| VNPay return scheme | lay tu `BACKEND_CONFIG.vnpayReturnScheme` |

Luu y:

- `src/core/backend.ts` la source of truth cho path helper.
- `src/core/api.ts` gia dinh response wrapper co dang `response.data.data`.

### 2. Response wrapper expectation

Mobile code unwrap response theo pattern:

```json
{
  "data": {}
}
```

Tai lieu tich hop cu mo ta mot wrapper day du hon:

```json
{
  "code": 200,
  "isSuccess": true,
  "message": "Success",
  "data": {},
  "errors": {},
  "timestamp": "2026-04-27T15:00:00Z"
}
```

Ket luan:

- `data` la phan bat buoc mobile dang dung truc tiep.
- Cac field khac la `optional but expected by convention`.

### 3. Auth APIs

#### Confirmed by code

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`

#### Mobile expectations

- Login tra ve auth payload co `accessToken`, `refreshToken` va thong tin user du de map sang `AuthUser`.
- Refresh tra ve payload moi cung shape voi login de interceptor co the luu lai token.
- Logout chap nhan body chua `refreshToken`.

#### Notes

- `GET /auth/me` duoc nhac trong SYSTEM/PRD nhung chua thay service su dung truc tiep trong mobile code hien tai.
- OTP flow co route UI nhung endpoint xac thuc OTP chua duoc the hien ro trong service layer nay.

### 4. User profile APIs

#### Confirmed by code

- `GET /users/me/profile`
- `PUT /users/me/profile`
- `GET /users/{id}/profile`
- `GET/POST/PUT/DELETE /users/educations`
- `GET/POST/PUT/DELETE /users/experiences`
- `GET/POST/PUT/DELETE /users/languages`
- `GET/POST/PUT/DELETE /users/certificates`

#### Mobile expectations

- Profile response duoc map thanh user full profile co avatar, bio, educations, experiences, certificates.
- Public profile duoc mentor listing/detail tai su dung de bo sung thong tin ten va avatar.

### 5. Mentor va package APIs

#### Confirmed by code

- `GET /mentors`
- `GET /mentors/{id}`
- `GET /mentors/{id}/packages`
- `PUT /mentors/me`
- `GET /mentors/me/packages`
- `POST /mentors/me/packages`
- `DELETE /mentors/me/packages/{pkgId}`
- `PATCH /mentors/me/packages/{pkgId}/status`
- `GET /mentors/me/packages/{id}/versions/{vid}/curriculums`
- `POST /mentors/me/packages/{id}/versions/{vid}/curriculums`

#### Mobile expectations

- Mentor public APIs phai duoc dung ma khong can auth.
- Mentor dashboard/service manager can co package list rieng cho mentor da dang nhap.
- Buyer checkout tren `packageVersionId`, khong checkout truc tiep tren package cha.

### 6. Order, payment va booking APIs

#### Confirmed by code

- `POST /orders/checkout`
- `GET /orders/me`
- `GET /orders/{id}`
- `GET /bookings/me/buyer`
- `GET /bookings/me/mentor`
- `GET /bookings/{id}`
- `PATCH /bookings/{bookingId}/sessions/{sessionId}`
- `POST /bookings/{bookingId}/sessions/{sessionId}/evidences`

#### Mobile expectations

- Checkout body gui `packageVersionId`.
- Order detail duoc dung de poll den khi `paid` hoac `cancelled`.
- Booking session co the cap nhat `status`, `meetingUrl`, `scheduledAt`.
- Evidence co body gom `type` va `url`.

#### Notes

- PRD/SYSTEM dung state `canceled`, trong code `pollUntilPaid` dang check `cancelled`; day la mot gap can luu y.

### 7. Messaging APIs

#### Current mobile implementation

- Chua co API thuc duoc goi tu `chatService`.
- Conversation, messages va session context hien dang den tu mock data.

#### Expected system capability

- Conversation list.
- Message list theo conversation.
- Gui message text/file/image.
- Gan conversation voi booking khi can.

### 8. File upload/download

#### Confirmed by code

- `POST /files/upload`
- `GET /files/{fileId}`

#### Mobile expectations

- Upload field name phai khop `BACKEND_CONFIG.uploadFieldName`.
- Multipart upload khong duoc gui voi `Content-Type: application/json`.
- File private can co check quyen o backend, vi app co kha nang gan file voi certificate, evidence va avatar.

## Open questions / Known gaps

- Chua co source backend chinh thuc trong repo nay de xac nhan 100% response schema.
- Messaging, report/dispute, progress report chua co service API thuc te ro rang tu phia mobile.
- Can thong nhat ten/trang thai `canceled` va `cancelled` giua docs, backend va code.
