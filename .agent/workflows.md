# Workflows

## Khi them man hinh moi cho feature da co

1. Tao screen trong `src/features/<feature>/screens/`
2. Neu man hinh can data, them hoac sua service trong `src/features/<feature>/services/`
3. Neu du lieu tu backend chua khop UI model, cap nhat adapter trong `src/features/<feature>/adapters/`
4. Chi them store Zustand neu state can chia se giua nhieu man hinh
5. Tao route entry mong trong `app/` neu can route moi

## Khi them feature moi

1. Xac dinh domain va ownership
2. Tao thu muc `src/features/<feature>/`
3. Them `screens/`, `services/`, `adapters/`, `store/`, `components/` neu can
4. Wiring route trong `app/`
5. Neu can compatibility voi code cu, moi tao wrapper trong `src/core/`

## Khi sua auth

1. Kiem tra `app/_layout.tsx` de tranh pha redirect logic
2. Kiem tra `src/features/auth/store/authStore.ts` cho hydrate, login, logout
3. Kiem tra `src/core/api.ts` cho token storage va refresh flow
4. Neu thay shape user/token, cap nhat ca service, adapter va cache AsyncStorage

## Khi sua API/backend integration

1. Xac dinh repo dang chay mock hay that qua `src/core/config.ts`
2. Neu sua endpoint hoac response shape, cap nhat feature service truoc roi toi feature adapter
3. Giu thong bao loi o muc user-facing, khong nem truc tiep raw server payload ra UI

## Khi sua route

1. Kiem tra route entry trong `app/`
2. Kiem tra feature screen duoc route tro toi
3. Kiem tra `_layout.tsx` neu route thuoc auth, tabs hoac protected pages
4. Dam bao route moi khong pha redirect hien co

## Kiem tra toi thieu sau khi sua

- Chay `npm run lint`
- Neu sua route auth:
  - chua login phai vao duoc `/(auth)/login`
  - da login khong duoc quay lai auth screen
- Neu sua UI responsive:
  - kiem tra tren it nhat mot man hep va mot man rong
- Neu sua feature flow:
  - kiem tra route entry
  - kiem tra feature screen
  - kiem tra service/store lien quan

## Nhung viec nen tranh

- Khong hard-code them API URL moi trong screen/component
- Khong them business logic nang truc tiep vao file route neu co the dua sang `src/features/`
- Khong tao state trung voi du lieu da co trong Zustand tru khi state do chi mang tinh local UI
- Khong them logic domain moi vao wrapper `src/core/services/*`, `src/core/store/*`, `src/core/adapters/*`
