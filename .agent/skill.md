# Skill

Tai lieu nay tong hop bo ky nang va quy trinh code chuan cho `sociedu-mobile`.
Muc tieu cua repo la cho phep nhieu thanh vien co the cung phat trien giao dien app ma it xung dot, de review va de tiep noi.

## 1. Tu duy goc cua repo

Agent phai lam viec voi 4 nguyen tac nen:

1. `src/features/` la source of truth theo domain
2. `app/` chi la route layer mong cua Expo Router
3. `src/components/` la shared UI layer, khong phai noi chua logic man hinh
4. `src/core/` la ha tang chung va compatibility wrapper, khong phai noi uu tien de viet logic domain moi

Neu mot thay doi lam lech 4 nguyen tac tren, agent phai dung lai va xac dinh lai source of truth.

## 2. Ky nang doc hieu codebase dung cach

Truoc khi sua, agent phai tra loi duoc:

1. Van de nay thuoc feature nao
2. Man hinh nay dang duoc route tu file nao trong `app/`
3. Logic that su dang nam o screen, service, adapter hay store
4. Co wrapper nao trong `src/core/` dang giu compatibility khong
5. UI nay dung shared component nao va bam theme/responsive nao

Chuan muc:

- Khong ket luan kien truc chi tu 1 file.
- Khong sua file route neu chua doc feature screen duoc route toi.
- Khong sua wrapper trong `src/core/` neu chua doc feature implementation phia sau no.

## 3. Ky nang lam viec de nhieu nguoi code song song

Repo nay uu tien chia ownership theo feature. Agent phai giu cach lam viec nay:

- Neu task thuoc `mentor`, uu tien sua trong `src/features/mentor/...`
- Neu task thuoc `booking`, uu tien sua trong `src/features/booking/...`
- Neu task thuoc `profile`, uu tien sua trong `src/features/profile/...`
- Neu task chi la wiring route, moi sua `app/...`
- Neu task la shared UI, moi sua `src/components/...`

Nguyen tac tranh xung dot:

- Khong dat business logic chung vao `app/`
- Khong keo logic cua feature A sang feature B neu khong that su can
- Khong tao utility chung chung neu no moi phuc vu 1 feature
- Uu tien component noi bo cua feature truoc khi nang cap thanh shared component

## 4. Quy trinh chuan khi sua giao dien

Khi sua mot man hinh UI, agent phai di theo thu tu:

1. Doc route entry trong `app/`
2. Doc feature screen la source of truth
3. Doc component con trong feature hoac shared UI lien quan
4. Doc `theme.ts`, `responsiveUtils.ts`, va responsive helper neu co
5. Xac dinh state nao la local UI state, state nao la shared state
6. Sua o lop thap nhat co the giai quyet dung van de

Chuan muc:

- Khong sua `app/` de fix van de layout neu screen that su nam trong `src/features/...`
- Khong fix du lieu sai bang condition trong JSX neu adapter/service moi la noi dung
- Khong dua API call vao screen

## 5. Quy trinh chuan khi them man hinh moi

Neu can them mot man hinh moi, agent phai lam dung thu tu sau:

1. Xac dinh man hinh do thuoc feature nao
2. Tao screen trong `src/features/<feature>/screens/`
3. Neu can data, tao hoac sua service trong `src/features/<feature>/services/`
4. Neu response shape khac UI model, tao hoac sua adapter trong `src/features/<feature>/adapters/`
5. Neu state can chia se qua nhieu man hinh, tao store trong `src/features/<feature>/store/`
6. Cuoi cung moi them route entry mong trong `app/`

Chuan muc:

- Khong tao man hinh moi truc tiep trong `app/` roi de logic o do
- Khong them state toan cuc cho nhu cau chi cuc bo trong 1 screen
- Khong them wrapper trong `src/core/` neu khong co nhu cau compatibility that

## 6. Quy trinh chuan khi sua route

Khi sua route, agent phai kiem tra:

- `app/_layout.tsx` neu route lien quan auth hoac protected stack
- `app/(auth)/_layout.tsx` neu route thuoc auth
- `app/(tabs)/_layout.tsx` neu route thuoc tab flow
- file route entry dang sua
- feature screen phia sau route do

Chuan muc:

- Route file trong `app/` nen uu tien chi `export { default }`
- Role-specific screen phai qua `ProtectedRoute` hoac guard ro rang
- Khong de route moi pha redirect hien co

## 7. Quy trinh chuan khi sua auth

Auth la vung rui ro cao. Truoc khi sua, agent phai doc:

- `app/_layout.tsx`
- `app/(auth)/_layout.tsx`
- `src/features/auth/store/authStore.ts`
- `src/features/auth/services/authService.ts`
- `src/core/api.ts`

Can hieu ro:

- hydrate session xay ra luc nao
- redirect guest va logged-in user xay ra o dau
- access token, refresh token va cached user duoc luu o dau
- logout se clear du lieu nao

Chuan muc:

- Khong tao auth state cuc bo trong screen
- Khong bypass refresh flow bang patch UI
- Khong doi auth redirect ma khong kiem tra ca guest flow va logged-in flow

## 8. Quy trinh chuan khi sua data layer

Khi task lien quan data, agent phai di theo thu tu:

1. DTO backend nam o `src/core/types.ts`
2. Service feature goi API hoac mock
3. Adapter feature map DTO sang UI model
4. Store hoac screen nhan model da duoc chuan hoa

Chuan muc:

- Screen khong tu map raw DTO neu adapter da co
- Service khong nen tra shape mo ho cho UI
- Neu `USE_MOCK = true`, kiem tra mock path truoc khi ket luan bug
- Wrapper trong `src/core/services/*` phai tiep tuc tro dung sang feature implementation

## 9. Quy trinh chuan khi sua state

Agent phai phan biet ro:

- Local UI state: modal open, tab chon, text input tam thoi, loading cuc bo
- Shared feature state: booking list, auth session, data can dung lai giua nhieu man

Chuan muc:

- Local state de o component/screen
- Shared state moi dua vao Zustand
- Store cua feature dat trong `src/features/<feature>/store/`
- Khong luu 1 entity o nhieu noi ma khong co ly do

## 10. Quy trinh chuan khi sua shared UI

Khi sua `src/components/`, agent phai coi day la thay doi anh huong toan app.

Truoc khi sua can doc:

- component dang sua
- responsive helper di kem neu co
- `src/theme/theme.ts`
- `src/theme/responsiveUtils.ts`
- `docs/ARCHITECTURE.md`

Chuan muc:

- Khong them visual language moi neu task khong yeu cau
- Khong hard-code spacing, font size, card size neu theme/responsive da co
- Neu component chi phuc vu 1 feature, nen dat trong feature do thay vi nang len shared layer

## 11. Quy trinh debug chuan muc

Khi gap loi, agent phai debug theo thu tu:

1. Xac dinh noi loi bieu hien
2. Lan nguoc route va source of truth
3. Kiem tra du lieu vao
4. Kiem tra adapter/service/store
5. Kiem tra dieu kien bien va role/auth state
6. Chi sua khi da co gia thuyet ro rang
7. Verify lai tren dung flow gay loi

Mau debug theo loai loi:

- Loi route: route entry, layout, redirect logic, params
- Loi auth: hydrate, token storage, refresh flow, `isAuthenticated`, `userRole`
- Loi UI: theme, responsive helper, props, shared component
- Loi data: `USE_MOCK`, endpoint, unwrap, adapter, error mapping
- Loi state: noi ghi, noi doc, timing fetch, loading/error state

## 12. Quy trinh refactor dung chuan

Refactor chi duoc xem la dung khi:

- giam duplication
- tang do ro trach nhiem
- dua logic ve dung feature/layer
- khong doi hanh vi ngoai y muon
- khong lam route hay auth flow kho hieu hon

Refactor nho dung cach:

1. Xac dinh pham vi hep
2. Di chuyen source of truth ve dung cho
3. Giu route entry mong
4. Giu wrapper compatibility neu import cu con ton tai
5. Cap nhat docs neu kien truc doi

## 13. Checklist review truoc khi ket thuc

Truoc khi chot task, agent phai tu hoi:

1. Thay doi nay co dung source of truth khong
2. Co de logic sai cho vao `app/` khong
3. Co pha auth redirect hoac role guard khong
4. Co pha responsive system khong
5. Co tao duplication giua feature va shared layer khong
6. Co can giu compatibility wrapper khong
7. Co file tai lieu nao can cap nhat khong

## 14. Tieu chuan giao tiep ky thuat

Khi lam viec, agent phai giao tiep theo cach sau:

- Noi ro dang sua layer nao va vi sao
- Neu co gia dinh, phai noi ro
- Bao rui ro that, khong noi chung chung
- Ket luan bang thay doi da lam, cach verify da chay, va phan chua verify duoc

Chuan muc:

- ngan gon nhung cu the
- khong dung ngon ngu mo ho neu chua verify

## 15. Tieu chuan hoan thanh cho repo nay

Mot thay doi duoc xem la dung voi muc tieu “nhieu thanh vien co the cung code giao dien” khi:

- feature ownership ro rang
- route layer van mong
- shared UI layer khong bi nhom logic domain vao
- auth va role guard van on dinh
- responsive system van duoc ton trong
- nguoi khac co the mo feature lien quan va tiep tuc code ma khong phai doan source of truth
