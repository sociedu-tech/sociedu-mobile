# Backend-Mobile Integration Review

## Current mobile expectation
- Base URL: `https://vietdemo.com/api_mentor`
- API prefix: `/api/v1`
- Effective API root: `https://vietdemo.com/api_mentor/api/v1`
- Upload field name: `file`
- Expected VNPay return scheme: `unisharemobile://payment-result`

## Core APIs to verify
1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/login`
3. `GET /api/v1/users/me/profile`
4. `POST /api/v1/auth/refresh`
5. `POST /api/v1/auth/logout`
6. `POST /api/v1/orders/checkout`
7. Upload endpoint used by backend

## Required request headers
- Public JSON APIs: `Content-Type: application/json`
- Protected APIs: `Authorization: Bearer <accessToken>`
- Multipart upload APIs: do not reuse `application/json`; send `multipart/form-data`

## Response wrapper expected by mobile
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

## Auth response contract expected by mobile
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": "uuid-user-id",
  "email": "user@example.com",
  "firstName": "Nguyen",
  "lastName": "An",
  "roles": ["ROLE_USER"]
}
```

## Profile response contract expected by mobile
```json
{
  "profile": {
    "userId": "uuid-user-id",
    "firstName": "An",
    "lastName": "Nguyen",
    "headline": "Software Engineer",
    "avatarFileId": "uuid-file-id",
    "bio": "Hello",
    "location": "Ha Noi",
    "createdAt": "2026-04-01T10:00:00Z",
    "updatedAt": "2026-04-27T10:00:00Z"
  },
  "educations": [],
  "languages": [],
  "experiences": [],
  "certificates": []
}
```

## Postman verification order
1. Register a user and confirm backend returns JSON, not HTML.
2. Login and store `accessToken` plus `refreshToken`.
3. Call `GET /users/me/profile` with `Authorization: Bearer <accessToken>`.
4. Call `POST /auth/refresh` with body `{ "refreshToken": "..." }`.
5. Retry profile with the refreshed access token.
6. Call checkout and confirm backend returns `paymentUrl`.
7. Test file upload with `form-data` and field name `file`.

## Common failure patterns
- `404` or `405`: base URL or context-path mismatch.
- `401` on profile: missing bearer token, expired access token, or backend filter issue.
- `401` on refresh: wrong refresh path, wrong request body, or backend returns wrong response shape.
- `415` or missing part on upload: wrong content type or wrong multipart field name.
- Payment returns to `localhost`: invalid VNPay return URL for device testing.
- Browser-only CORS error: backend CORS config missing for web/webview usage.

## Files in mobile app that define the contract
- [`src/core/backend.ts`](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/backend.ts)
- [`src/core/api.ts`](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/api.ts)
- [`src/core/services/authService.ts`](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/services/authService.ts)
- [`src/core/services/userService.ts`](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/services/userService.ts)
- [`src/core/services/orderService.ts`](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/src/core/services/orderService.ts)
