# Skill

Tai lieu nay mo ta bo ky nang chuan ma mot coding agent phai van dung khi xu ly task trong `sociedu-mobile`.

## 1. Ky nang doc hieu codebase

Agent phai:

- Xac dinh lop cua van de truoc: route, feature screen, feature service, feature adapter, feature store, UI chung, theme hay config.
- Tim source of truth thay vi sua theo cam tinh tai noi loi bieu hien.
- Doc toi thieu nhung dung file, dua tren `.agent/mandatory-reading.md`.
- Phan biet component dung chung o `src/components/` voi component noi bo cua feature trong `src/features/<feature>/components/`.
- Phan biet wrapper trong `app/` va `src/core/` voi file source of truth trong `src/features/`.

Chuan muc:

- Khong ket luan kien truc chi tu mot file.
- Khong sua khi chua hieu luong du lieu vao va ra.

## 2. Ky nang phan ra van de

Khi nhan task, agent phai tach thanh cac cau hoi:

1. Day la van de ve hien thi, dieu huong, du lieu, trang thai hay kien truc
2. Loi xuat hien o dau va nguon goc nam o dau
3. Can sua toi thieu o may lop de giai quyet tan goc
4. Tieu chi hoan thanh la gi

Chuan muc:

- Uu tien root cause hon patch be mat.
- Neu mot bug xuat phat tu data shape, sua o adapter hoac service truoc khi va UI.

## 3. Ky nang lam viec voi routing

Agent phai:

- Hieu Expo Router dung file-based routing.
- Kiem tra anh huong cua `_layout.tsx` truoc khi them hoac doi route.
- Bao ve auth flow va role guard khi them man hinh protected.
- Uu tien de route file trong `app/` chi lam route entry, con logic man hinh nam trong `src/features/.../screens/`.

Chuan muc:

- Khong chi them screen roi de auth tu xu ly ngam.
- Neu man hinh can role dac biet, phai quyet dinh ro dung `ProtectedRoute` hay root guard.

## 4. Ky nang lam viec voi auth

Agent phai:

- Doc `app/_layout.tsx`, `src/features/auth/store/authStore.ts`, `src/features/auth/services/authService.ts`, `src/core/api.ts` truoc khi chinh.
- Giu thong nhat giua cache user, access token, refresh token va redirect logic.
- Ton trong flow hydrate khi app khoi dong.

Chuan muc:

- Khong tao auth state cuc bo trong screen thay cho store.
- Khong bypass flow refresh token bang logic ad hoc trong UI.

## 5. Ky nang lam viec voi API va data mapping

Agent phai:

- Xem backend tra DTO gi, app can model gi.
- Dung adapter de map thay vi nhoi logic transform o screen.
- Kiem tra mock path neu `USE_MOCK = true`.
- Dat service va adapter moi vao feature tuong ung neu domain da duoc tach.

Chuan muc:

- Screen khong goi API truc tiep.
- Service khong nen tra shape kho dung neu adapter co the chuan hoa.
- Error handling phai du cho UI nhung khong lam mat ngu nghia.

## 6. Ky nang quan ly state

Agent phai:

- Giu local UI state trong component neu chi dung tai cho.
- Chi dua vao Zustand khi state can chia se, luu giu hoac phoi hop giua nhieu man.
- Dat store cua domain da tach vao `src/features/<feature>/store/`.
- Tranh source of truth kep.

Chuan muc:

- Khong tao store chi de luu state form tam thoi neu khong can.
- Khong dong thoi luu mot entity o ca store va nhieu local state ma khong co ly do.

## 7. Ky nang xay UI va responsive

Agent phai:

- Bam `theme.ts`, `responsiveUtils.ts` va cac responsive helper co san.
- Giu visual language hien co neu task khong yeu cau redesign.
- Kiem tra man nho va man lon khi sua spacing, typography, kich thuoc card hoac avatar.

Chuan muc:

- Khong hard-code kich thuoc moi mot cach tuy tien.
- Khong bo qua quy chuan responsive trong `docs/ARCHITECTURE.md` khi sua UI quan trong.

## 8. Ky nang them feature moi

Quy trinh chuan:

1. Xac dinh route moi hay chi la thanh phan cua route cu
2. Xac dinh domain lien quan
3. Tao screen trong `src/features/<feature>/screens/`
4. Tao service truoc neu feature can du lieu
5. Tao adapter neu response shape khong truc tiep phu hop
6. Tao store chi khi can chia se state
7. Wiring route trong `app/` bang file entry mong

Chuan muc:

- Feature moi phai di dung lop.
- Khong lay screen lam trung tam chua het moi logic.

## 9. Ky nang debug chuan muc

Khi gap loi, agent phai di theo thu tu:

1. Xac dinh noi loi bieu hien
2. Lan nguoc source of truth
3. Kiem tra luong du lieu vao
4. Kiem tra dieu kien bien
5. Chi sua sau khi co gia thuyet ro rang
6. Verify lai o dung luong gay loi

Khuon mau debug:

- Loi route: kiem tra file route entry, feature screen, `_layout`, redirect logic, params
- Loi auth: kiem tra hydrate, token storage, interceptor, `isAuthenticated`, `userRole`
- Loi UI: kiem tra theme, responsive helper, props truyen vao, du lieu adapter
- Loi API: kiem tra `USE_MOCK`, endpoint, unwrap, adapter, error mapping
- Loi state: kiem tra noi ghi state, noi doc state, timing fetch, loading/error state

Chuan muc:

- Khong fix bang cach them condition chong condition neu chua ro nguyen nhan.
- Khong xoa logic cu chi vi chua hieu no.

## 10. Ky nang refactor

Refactor chi duoc xem la chuan khi:

- giam duplication
- tang do ro trach nhiem
- khong doi hanh vi ngoai y muon
- khong lam route hoac flow auth kho hieu hon
- dua logic ve dung feature hoac dung lop ha tang

Chuan muc:

- Refactor nho, co muc tieu ro.
- Khong gom qua nhieu thay doi khong lien quan trong mot lan sua.

## 11. Ky nang review truoc khi ket thuc

Truoc khi chot task, agent phai tu hoi:

1. Thay doi nay co dung source of truth khong
2. Co pha mock flow khong
3. Co pha responsive khong
4. Co lam route hoac auth kho doan hon khong
5. Co tao file moi khong can thiet khong
6. Co cho nao nen cap nhat tai lieu khong

## 12. Ky nang giao tiep ky thuat

Agent phai:

- Noi ro dang sua lop nao va vi sao.
- Neu duoc gia dinh khi chua du du lieu.
- Bao rui ro that, khong noi chung chung.
- Ket luan bang thay doi thuc te, kiem tra da lam, va phan chua kiem tra duoc.

Chuan muc:

- Ngan gon nhung cu the.
- Khong dung ngon ngu mo ho nhu "co the on", "chac la duoc" neu chua verify.
