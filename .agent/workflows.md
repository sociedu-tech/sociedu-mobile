# Workflows

## Khi them man hinh moi cho feature da co

1. Tao screen trong `src/features/<feature>/screens/`
2. Neu man hinh can data, them hoac sua service trong `src/features/<feature>/services/`
3. Neu du lieu backend chua khop UI model, cap nhat adapter trong `src/features/<feature>/adapters/`
4. Chi them store Zustand neu state can chia se giua nhieu man hinh
5. Tao route entry mong trong `app/` neu can route moi

## Khi them feature moi

1. Xac dinh domain va ownership
2. Tao thu muc `src/features/<feature>/`
3. Them `screens`, `services`, `adapters`, `store`, `components` neu can
4. Wiring route trong `app/`
5. Neu can compatibility voi code cu, moi tao wrapper trong `src/core/`

## Khi sua auth

1. Kiem tra `app/_layout.tsx` de tranh pha redirect logic
2. Kiem tra `app/(auth)/_layout.tsx` de tranh auth screens cho user da login
3. Kiem tra `src/features/auth/store/authStore.ts` cho hydrate, login, logout
4. Kiem tra `src/core/api.ts` cho token storage va refresh flow
5. Neu thay shape user/token, cap nhat service, adapter va cache AsyncStorage cung luc

## Khi sua API/backend integration

1. Xac dinh repo dang chay mock hay backend that qua `src/core/config.ts`
2. Sua feature service truoc
3. Sua feature adapter neu response shape doi
4. Giu error user-facing co nghia, khong nem raw payload len UI
5. Neu wrapper trong `src/core` can tiep tuc tro den feature implementation, giu no on dinh

## Khi sua route

1. Kiem tra route entry trong `app/`
2. Kiem tra feature screen duoc route tro toi
3. Kiem tra layout neu route thuoc auth, tabs hoac protected pages
4. Dam bao route moi khong pha redirect hien co
5. Neu route bi xoa, quet lai wiring, imports va docs lien quan

## Khi sua UI responsive

1. Doc component/shared UI lien quan
2. Doc `src/theme/theme.ts` va `src/theme/responsiveUtils.ts`
3. Kiem tra helper responsive di kem component neu co
4. Test it nhat 1 man hep va 1 man rong

## Khi sua tai lieu

1. Doi chieu voi code that, khong dua theo lich su refactor
2. Uu tien cap nhat `AGENTS.md`, `.agent/*`, `SYSTEM.md`, `docs/ARCHITECTURE.md` neu thay doi kien truc
3. Kiem tra route map, feature map, mock status, lint command va source of truth deu dung voi code hien tai

## Kiem tra toi thieu sau khi sua

- Chay `npm run lint`
- Neu sua auth:
  - chua login vao duoc `/(auth)/login`
  - da login khong o lai auth screens
- Neu sua protected route:
  - role khong hop le bi redirect ve `/(tabs)`
- Neu sua feature flow:
  - route entry dung
  - feature screen dung
  - service/store lien quan dung
- Neu sua UI:
  - man hep va man rong khong vo layout

## Nhung viec nen tranh

- Khong hard-code them API URL moi trong screen/component
- Khong them business logic nang truc tiep vao file route
- Khong tao state trung voi du lieu da co trong Zustand neu do chi la local UI
- Khong them logic domain moi vao wrapper `src/core/services/*`, `src/core/store/*`, `src/core/adapters/*`
