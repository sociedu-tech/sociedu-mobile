# Instruction

Tai lieu nay dinh nghia quy trinh lam viec chuan cho agent khi lap trinh trong repo `sociedu-mobile`.

## 1. Muc tieu lam viec

- Giu codebase de mo rong, de review va de debug.
- Ton trong kien truc Expo Router + `src/core` hien co.
- Uu tien tinh nhat quan hon la them pattern moi.
- Moi thay doi phai giai quyet dung bai toan, khong chi lam code chay tam.

## 2. Quy trinh bat buoc truoc khi viet code

### Buoc 1: Doc tai lieu loi

Phai doc:

1. `AGENTS.md`
2. `.agent/instruction.md`
3. `.agent/mandatory-reading.md`
4. `.agent/skill.md`

### Buoc 2: Doc tai lieu theo loai task

Xem bang trong `.agent/mandatory-reading.md` roi mo dung file lien quan truoc khi sua.

### Buoc 3: Xac dinh pham vi thay doi

- Screen hay route: nam trong `app/`
- Service, API, adapter, store: nam trong `src/core/`
- UI tai su dung: nam trong `src/components/`
- Theme hoac responsive: nam trong `src/theme/`
- Tai lieu: nam trong `.agent/` hoac `docs/`

### Buoc 4: Kiem tra rang buoc hien tai

- Auth flow dang di qua `app/_layout.tsx` va `src/core/store/authStore.ts`
- Mock API dang bat trong `src/core/config.ts`
- API base URL dang hard-code trong `src/core/api.ts`
- Responsive system da duoc chuan hoa trong `docs/ARCHITECTURE.md`, `src/theme/responsiveUtils.ts` va cac responsive helper lien quan

### Buoc 5: Chi viet code sau khi tra loi duoc 4 cau hoi

1. File nao la nguon su that cho thay doi nay
2. Thay doi nay anh huong route nao, store nao, service nao
3. Co can giu tuong thich voi mock data hay khong
4. Cach kiem tra thay doi sau khi sua la gi

## 3. Kien truc chuan can tuan thu

### 3.1 Routing

- `app/` chi nen chua route, layout va logic man hinh.
- Khong don business logic nang truc tiep vao file route neu co the dua xuong `src/core/`.
- Khi them man hinh moi, giu dung quy uoc Expo Router.

### 3.2 Core logic

- `src/core/services/`: goi API, orchestration nghiep vu theo domain
- `src/core/adapters/`: map DTO tu backend sang model app
- `src/core/store/`: state chia se giua nhieu man hinh
- `src/core/api.ts`: axios instance, token handling, error handling
- `src/core/config.ts`: co cau hinh dung chung

### 3.3 UI layer

- `src/components/` la nguon component noi bo chinh.
- Khong tao component dung lai trong screen neu co kha nang tai su dung ro rang.
- Thu muc `components/` o root la dau vet starter; khong mo rong them neu khong co ly do rat ro.

### 3.4 Theme va responsive

- Mau, spacing, typography phai bam `src/theme/theme.ts`.
- Responsive phai dung utility trong `src/theme/responsiveUtils.ts` hoac he hien co.
- Khong hard-code kich thuoc lon trong screen neu da co scale function.

## 4. Nguyen tac code

### 4.1 Nguyen tac to chuc

- Mot file chi nen co mot trach nhiem chinh.
- Ten file phan anh dung trach nhiem.
- Tranh tao utility chung chung kieu `helpers.ts` neu chuc nang khong ro rang.
- Khong them abstraction moi neu chua co it nhat hai noi can dung.

### 4.2 Nguyen tac TypeScript

- Giu `strict` an toan; khong mo rong `any` tru truong hop bi chan boi du lieu ngoai va da co lap bien.
- Uu tien type/domain model ro rang hon object inline dai.
- DTO backend va model dung trong app can tach bang adapter neu khac shape.

### 4.3 Nguyen tac state

- Local UI state de trong screen/component.
- Shared state moi dua vao Zustand.
- Khong tao store moi chi de chua state cua mot man hinh don le neu khong co nhu cau chia se that.
- Khong nhan doi source of truth giua store va component state tru khi la derived UI state.

### 4.4 Nguyen tac API va service

- Khong goi `axios` truc tiep trong screen.
- Moi loi goi network di qua service.
- Moi bien doi du lieu backend co y nghia domain di qua adapter.
- Error message tra ve UI phai co ngu nghia, tranh day raw response len screen.

### 4.5 Nguyen tac UI

- Uu tien dung `Typography`, `CustomButton` va component dung lai san co.
- Giu style ro rang, tranh inline style lon trong JSX.
- Khong tu y doi visual language cua app khi task khong yeu cau.

### 4.6 Nguyen tac comment va tai lieu

- Chi comment khi logic kho doc hoac co rang buoc nghiep vu khong hien nhien.
- Neu thay doi lam lech tai lieu `.agent/` hoac `docs/` thi phai cap nhat lai.

## 5. Quy chuan code

### Dat ten

- Route file: theo chuan Expo Router, vi du `index.tsx`, `[id].tsx`, `edit.tsx`
- Component: `PascalCase`
- Hook, service, util: `camelCase`
- Hang so: `UPPER_SNAKE_CASE` khi that su la constant bat bien

### Import

- Uu tien alias `@/` khi repo da ho tro, nhung phai giu nhat quan trong file dang sua.
- Khong tao chuoi import tuong doi dai kho doc neu co alias phu hop.

### Cau truc file screen

Thu tu uu tien:

1. imports
2. constants/types cuc bo
3. component chinh
4. helper function nho neu that su gan chat voi screen
5. styles

### Cau truc file service

1. imports
2. base constant
3. service object
4. cac method theo nhom chuc nang

## 6. Checklist truoc khi sua code

- Da doc file bat buoc trong `.agent/mandatory-reading.md`
- Da xac dinh source of truth
- Da xac dinh file nao khong nen sua
- Da xac dinh can test bang gi: lint, flow auth, flow route, flow responsive

## 7. Checklist truoc khi ket thuc task

- Code chay hop ly ve mat logic
- Khong pha route hien co
- Khong pha auth redirect
- Khong them hard-code moi trai quy chuan
- Khong tao duplication ro rang
- Da cap nhat tai lieu neu thay doi kien truc/quy trinh

## 8. Nhung dieu cam

- Khong goi API truc tiep trong screen.
- Khong hard-code them `API_BASE_URL` hoac env logic rai rac.
- Khong mo rong thu muc `components/` o root nhu noi chua component chinh moi.
- Khong bo qua responsive system khi sua UI.
- Khong them state toan cuc cho van de cuc bo.
- Khong sua file lon theo kieu rewrite toan bo khi chi can thay doi nho.

## 9. Tieu chuan hoan thanh

Mot thay doi chi duoc xem la hoan thanh khi:

- dung muc tieu nghiep vu
- khop kien truc hien tai
- khong tao no ky thuat ro rang
- co cach kiem tra hop ly
- co the duoc nguoi khac doc va tiep tuc ma khong phai doan y dinh
