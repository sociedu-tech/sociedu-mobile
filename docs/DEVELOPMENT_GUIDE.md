# Development Guide / Huong dan phat trien

## Muc dich / Purpose

Tai lieu nay giup thanh vien moi chay du an, hieu cau truc code va mo rong app ma khong pha vo cac quy uoc hien tai.

## Doi tuong doc / Audience

- Mobile developers moi vao du an.
- Mentor/lead can onboard nhanh.

## Nguon tham chieu / Sources

- `package.json`
- Thu muc `app/`
- Thu muc `src/`

## Noi dung chinh / Main content

### 1. Chay du an

```bash
npm install
npm run start
```

Lenh co san trong repo:

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`

### 2. Cau truc thu muc can nho

- `app/`: route va screen-level composition.
- `src/components/`: reusable UI components.
- `src/core/`: API, adapters, services, stores, constants, mocks.
- `src/theme/`: theme va responsive utilities.
- `docs/`: bo tai lieu chinh cua repo.

### 3. Nguyen tac them tinh nang moi

- Neu them man hinh moi: tao route trong `app/` va giu phan API/business logic trong `src/`.
- Neu them API moi: uu tien tao service trong `src/core/services/`, path helper trong `src/core/backend.ts` neu can, va adapter neu response can map.
- Neu them state xuyen suot: can nhac store trong `src/core/store/`.
- Neu them UI dung lai nhieu lan: dat trong `src/components/` thay vi viet lai trong tung screen.

### 4. Nguyen tac tich hop backend

- Dung `api` instance trong `src/core/api.ts` de huong loi tu interceptor va session refresh.
- Khong unwrap response truc tiep trong screen neu da co service.
- Neu backend tra field shape khac UI can, dua logic map vao `adapters`.
- Neu mot module chua co API that, ghi ro mock mode va tranh de UI gia dinh da production-ready.

### 5. Quy uoc practical trong repo hien tai

- App co song song real API va mock API thong qua `USE_MOCK`.
- Auth token va user cache duoc luu bang `AsyncStorage`.
- Route auth, buyer, mentor va admin da duoc scaffold kha rong; khi mo rong can uu tien giu role boundaries ro rang.
- `docs/KNOWN_GAPS.md` can duoc cap nhat moi khi co thay doi quan trong ve scope hoac implementation.

### 6. Khi nao can cap nhat docs

Cap nhat `docs/` moi khi co mot trong cac thay doi sau:

- Them route/man hinh moi.
- Them service API moi hoac doi contract endpoint.
- Chuyen mot module tu mock sang real API.
- Doi pham vi MVP hoac trang thai feature.
- Hop nhat hoac doi ten module san pham.

## Open questions / Known gaps

- Root `README.md` cua repo van la template Expo, nen chua giup onboarding tot bang bo docs moi.
- Chua co checklist release hoac testing workflow chinh thuc trong repo nay.
