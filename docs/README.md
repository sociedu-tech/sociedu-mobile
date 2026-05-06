# SocieDu Mobile Docs

## Muc dich / Purpose

`docs/` la bo tai lieu chinh cho repo `sociedu-mobile`. Muc tieu la giup Product, Engineering, QA va mentor trong team co cung mot bo mo ta ngan gon, nhat quan ve:

- Bai toan san pham Mentor Marketplace.
- Pham vi MVP data-aligned.
- Kien truc va implementation hien tai cua app mobile.
- API contract ma mobile dang ky vong.
- Khoang cach giua PRD, data model va codebase hien tai.

## Doi tuong doc / Audience

- Product, BA, QA can hieu scope MVP va business flow.
- Mobile developers can hieu route map, architecture, service layer va cach mo rong app.
- Backend developers can doi chieu API contract mobile dang su dung.
- Mentor/lead can dung bo docs nay de onboard thanh vien moi nhanh hon.

## Nguon tham chieu / Sources

- `SYSTEM.md` trong thu muc tai lieu nghiep vu goc.
- `PRD_v2_2_Data_Aligned.docx`.
- Codebase hien tai trong `app/`, `src/`, `package.json`.

## So do tai lieu / Document Map

- [PRODUCT_OVERVIEW.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/PRODUCT_OVERVIEW.md): tong quan san pham, actor, muc tieu, nguyen tac.
- [MVP_SCOPE.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/MVP_SCOPE.md): pham vi MVP, in-scope, out-of-scope, future phase.
- [SYSTEM_FLOWS.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/SYSTEM_FLOWS.md): cac luong nghiep vu chinh cua he thong.
- [MOBILE_ARCHITECTURE.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/MOBILE_ARCHITECTURE.md): kien truc va module implementation cua app mobile.
- [SCREEN_MAP.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/SCREEN_MAP.md): mapping giua business module va route/man hinh.
- [API_CONTRACT.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/API_CONTRACT.md): contract backend ma mobile dang ky vong va muc do xac nhan.
- [DEVELOPMENT_GUIDE.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/DEVELOPMENT_GUIDE.md): huong dan chay du an, cau truc ma nguon va nguyen tac mo rong.
- [KNOWN_GAPS.md](/D:/Users/Documents/HUCE/Phat_trien_Ung_dung_Da_nen_tang/DoAn/sociedu-mobile/docs/KNOWN_GAPS.md): chenh lech giua PRD/SYSTEM, data model va current mobile implementation.

## Cach su dung bo docs / How To Use

- Neu can hieu san pham: doc `PRODUCT_OVERVIEW.md` roi toi `MVP_SCOPE.md`.
- Neu can hieu flow nghiep vu: doc `SYSTEM_FLOWS.md`.
- Neu can code mobile: doc `MOBILE_ARCHITECTURE.md`, `SCREEN_MAP.md` va `API_CONTRACT.md`.
- Neu can onboard nhanh: doc `README.md` nay, sau do `KNOWN_GAPS.md` de biet nhung phan chua hoan tat.

## Nguyen tac doc hieu / Reading Notes

- Tai lieu phan biet ro 3 muc: `business intent`, `system capability`, `current mobile implementation`.
- Bat ky tinh nang nao chua co data model hoac chua thay trong app deu duoc danh dau la `Manual MVP`, `Future phase`, hoac `Not implemented in mobile yet`.
- Khi codebase va tai lieu goc mau thuan, bo docs nay uu tien ghi ro trang thai current implementation va lien ket sang `KNOWN_GAPS.md`.

## Open questions / Known gaps

- Root `README.md` cua repo van la mau Expo va chua tro toi bo docs nay.
- Chua co tai lieu backend chinh thuc trong repo nay nen `API_CONTRACT.md` van bao gom ca phan `expected` va `confirmed by code`.
