# Instruction

Quy trinh lam viec chuan cho moi thanh vien (hoac agent) phat trien giao dien trong `sociedu-mobile`.
Muc tieu: nhieu nguoi code song song tren cung repo ma it xung dot, de review va de tiep noi.

---

## 1. Nguyen tac nen tang

### 1.1 Feature Ownership – moi nguoi lam trong "nha" cua minh

Repo chia code theo domain. Moi thanh vien duoc phan cong 1 hoac vai feature. Khi lam task, uu tien sua trong thu muc feature cua minh:

| Nguoi | Lam o dau | Khong nen dung vao |
| --- | --- | --- |
| Dev A (mentor) | `src/features/mentor/...` | `src/features/booking/...` |
| Dev B (booking) | `src/features/booking/...` | `src/features/mentor/...` |
| Dev C (profile) | `src/features/profile/...` | `src/features/auth/...` |

Neu can chia se logic giua cac feature, trao doi truoc khi sua vao file chung.

### 1.2 Bon lop kien truc bat bien

```
app/              → route layer mong, chi wiring
src/features/     → source of truth theo domain
src/components/   → shared UI, khong chua logic man hinh
src/core/         → ha tang chung, khong phai noi viet logic domain
```

Moi thay doi phai nam dung lop. Neu khong chac, dung lai va doc lai muc nay.

### 1.3 Vung cam toan cuc

Nhung vung sau anh huong toan bo app. **Khong duoc sua ma khong thong bao team:**

- `app/_layout.tsx` – auth guard, root stack
- `app/(auth)/_layout.tsx` – auth redirect
- `app/(tabs)/_layout.tsx` – tab bar, tab order
- `src/features/auth/store/authStore.ts` – session state
- `src/core/api.ts` – Axios instance, token flow, refresh
- `src/core/types.ts` – DTO va mobile model chia se
- `src/components/ProtectedRoute.tsx` – role guard
- `src/theme/theme.ts` – color, spacing, typography tokens

---

## 2. Thu tu lam viec cho moi task (bat buoc)

### Buoc 1: Xac dinh loai task

| Loai | Sua o dau chinh | Anh huong pham vi |
| --- | --- | --- |
| Them/sua man hinh | `src/features/<feature>/screens/` | Hep – trong feature |
| Them route moi | `app/` + feature screen | Hep – route wiring |
| Sua shared UI | `src/components/` | Rong – toan app |
| Sua auth/role | `src/features/auth/` + layout | Rong – moi flow |
| Sua theme/responsive | `src/theme/` | Rong – moi component |
| Sua service/adapter | `src/features/<feature>/services/` | Hep – trong feature |

### Buoc 2: Doc file bat buoc theo loai task

Tra `.agent/mandatory-reading.md` de biet nhom file can doc. Khong can doc luot ca repo.

### Buoc 3: Tra loi 4 cau hoi truoc khi code

1. **Source of truth** cua thay doi nay nam o dau? (file nao la chinh)
2. **Pham vi anh huong**: route nao, feature nao, store nao bi tac dong?
3. **Tuong thich**: co wrapper hoac mock data nao can giu khong?
4. **Cach verify**: sau khi sua, lam sao kiem tra dung?

Neu chua tra loi duoc, doc them code truoc khi bat dau.

---

## 3. Quy trinh chuan khi phat trien giao dien

### 3.1 Tao man hinh moi

Thu tu bat buoc:

```
1. Xac dinh man hinh thuoc feature nao
2. Tao screen trong   src/features/<feature>/screens/ScreenName.tsx
3. Neu can data:      tao/sua service trong src/features/<feature>/services/
4. Neu shape khac:    tao/sua adapter trong src/features/<feature>/adapters/
5. Neu state chia se: tao store trong src/features/<feature>/store/
6. Cuoi cung:         them route entry mong trong app/
```

**Man hinh mau chuan** (pattern thuc te trong repo):

```tsx
// src/features/<feature>/screens/ExampleScreen.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/src/components/typography/Typography';
import { CustomButton } from '@/src/components/button/CustomButton';
import { Card } from '@/src/components/ui/Card';
import { Section } from '@/src/components/ui/Section';
import { theme } from '@/src/theme/theme';

export default function ExampleScreen() {
  // 1. Local UI state de o day
  // 2. Goi service qua useEffect, KHONG goi axios truc tiep
  // 3. Dung shared component co san, bam theme tokens

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <Section>
          <Typography variant="h2">Title</Typography>
          <Card>
            {/* Noi dung man hinh */}
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Route entry mau chuan:**

```tsx
// app/(tabs)/example.tsx hoac app/example/index.tsx
export { default } from '@/src/features/<feature>/screens/ExampleScreen';
```

### 3.2 Sua man hinh hien co

Thu tu doc truoc khi sua:

```
1. Route entry trong app/ → biet screen duoc map tu dau
2. Feature screen trong src/features/ → doc logic hien tai
3. Component con dung trong screen
4. theme.ts + responsiveUtils.ts → biet token dang dung
5. Service/adapter/store lien quan → biet data den tu dau
```

Chi sua o lop thap nhat giai quyet dung van de:
- Loi hien thi → sua screen hoac component
- Loi du lieu → sua service hoac adapter
- Loi route → sua app/ layout

### 3.3 Tao component UI moi

Truoc khi tao, tu kiem tra:

1. Da co shared component nao gan giong chua? (xem danh sach muc 4.1)
2. Component nay chi dung trong 1 feature hay nhieu feature?
   - **1 feature** → dat trong `src/features/<feature>/components/`
   - **Nhieu feature** → dat trong `src/components/<nhom>/`
3. Component phai bam theme tokens, khong hard-code mau/spacing/font

---

## 4. Shared resources – cai gi dung chung, dung the nao

### 4.1 Shared UI components co san

| Component | Duong dan | Dung khi |
| --- | --- | --- |
| `Typography` | `src/components/typography/` | Moi text tren app |
| `CustomButton` | `src/components/button/` | Button voi variant va responsive |
| `Card` | `src/components/ui/Card.tsx` | Card container co shadow |
| `Section` | `src/components/ui/Section.tsx` | Section voi padding chuan |
| `Avatar` | `src/components/ui/Avatar.tsx` | Hinh dai dien |
| `ListItem` | `src/components/ui/ListItem.tsx` | Dong trong danh sach |
| `TextInput` | `src/components/form/TextInput.tsx` | Input form |
| `Checkbox` | `src/components/form/Checkbox.tsx` | Checkbox form |
| `LoadingState` | `src/components/states/` | Spinner toan man hinh |
| `EmptyState` | `src/components/states/` | Trang thai rong |
| `ErrorState` | `src/components/states/` | Trang thai loi |
| `DataTable` | `src/components/display/` | Bang du lieu |
| `ProtectedRoute` | `src/components/` | Bao ve route theo role |

**Luat:** Uu tien dung component co san truoc khi tao moi. Neu can mo rong, sua component co san qua props moi (khong break API cu).

### 4.2 Theme tokens

Moi gia tri kich thuoc, mau sac, spacing, border radius, typography phai lay tu `src/theme/theme.ts`:

```tsx
// DUNG
style={{ padding: theme.spacing.md, backgroundColor: theme.colors.surface }}

// SAI – hard-code
style={{ padding: 16, backgroundColor: '#FFFFFF' }}
```

Danh sach token chinh:
- **Colors:** `primary`, `primaryLight`, `primaryLighter`, `secondary`, `background`, `surface`, `success`, `error`, `warning`, `info`
- **Text colors:** `theme.colors.text.primary/secondary/disabled/inverse`
- **Spacing:** `xs=4`, `sm=8`, `md=16`, `lg=24`, `xl=32`, `xxl=48`
- **Border radius:** `sm=4`, `md=8`, `lg=16`, `xl=24`, `full=9999`
- **Typography:** `h1`, `h2`, `h3`, `body`, `bodyMedium`, `caption`, `label`

### 4.3 Responsive system

Repo dung 3 tang responsive:

1. **Breakpoints** (`src/theme/breakpoints.ts`): `xs(<360)`, `sm(360-480)`, `md(480-768)`, `lg(768-1024)`, `xl(>1024)`
2. **Scale utilities** (`src/theme/responsiveUtils.ts`): `scaleFont()`, `scaleSpace()`, `scaleWidth()`, `scaleHeight()`, `isTablet()`, `getGridColumns()`
3. **Component responsive helpers** (vi du: `buttonResponsive.ts`, `typographyResponsive.ts`): dung `useBreakpoint()` de lay breakpoint hien tai

Khi lam UI moi, khong hard-code kich thuoc lon. Dung utility hoac token.

### 4.4 Data flow chuan

```
Backend API → service (goi api) → adapter (map DTO → UI model) → screen (render)
                                                                ↗ store (neu can chia se)
```

Cac quy tac:
- **Screen KHONG goi `axios` truc tiep.** Goi qua service.
- **Screen KHONG tu map raw DTO.** Adapter da lam viec nay.
- **DTO backend** nam trong `src/core/types.ts` (phan BACKEND DTOs)
- **UI model** nam trong `src/core/types.ts` (phan MOBILE TYPES)
- **Feature adapter** map tu DTO sang UI model
- **Error tra ve UI** phai co nghia, khong day raw payload len man hinh

### 4.5 State management

| Loai state | Dat o dau | Vi du |
| --- | --- | --- |
| Local UI | `useState` trong screen/component | modal open, tab index, loading local |
| Shared feature | Zustand store trong `src/features/<feature>/store/` | booking list, auth session |
| Toan app | `authStore` (da co) | user, isAuthenticated, userRole |

**Luat:** Khong tao store Zustand neu state chi dung trong 1 screen.

---

## 5. Quy tac tranh xung dot khi nhieu nguoi code

### 5.1 File ownership – ai lam gi

```
src/features/mentor/...    → Dev phu trach mentor
src/features/booking/...   → Dev phu trach booking
src/features/profile/...   → Dev phu trach profile
src/features/message/...   → Dev phu trach message
src/features/auth/...      → Chi lead hoac nguoi duoc chi dinh
src/components/...         → Thong bao team truoc khi sua
src/theme/...              → Thong bao team truoc khi sua
app/...                    → Chi them route entry mong, khong dat logic
```

### 5.2 Nhung dieu KHONG lam de tranh xung dot

1. **Khong dat business logic vao `app/`** – file route chi `export { default }` hoac layout wiring
2. **Khong keo logic feature A sang feature B** – neu can dung chung, tao shared service hoac bao team
3. **Khong sua `src/core/types.ts` ma khong thong bao** – file nay dung chung cho moi feature
4. **Khong tao utility chung chung neu no chi phuc vu 1 feature** – dat trong feature do
5. **Khong sua shared component ma khong kiem tra anh huong** – grep xem ai dang dung no
6. **Khong them style token moi vao `theme.ts` ma khong thong bao** – token la hop dong chung

### 5.3 Khi can sua file chung

Neu task bat buoc phai sua file chung (`types.ts`, `theme.ts`, shared component...):

1. Thong bao truoc tren kenh chung (ten file, ly do, pham vi thay doi)
2. Sua nho nhat co the (them properties, KHONG xoa hoac rename)
3. Kiem tra backward compatibility: import cu khong bi vo
4. Neu la component, chi them props moi, giu default cu

---

## 6. Quy chuan import va dat ten

### Import

```tsx
// Thu tu import chuan:
import React from 'react';                                    // 1. React/RN core
import { View } from 'react-native';
import { useRouter } from 'expo-router';                     // 2. Expo/third-party

import { Typography } from '@/src/components/.../Typography'; // 3. Shared UI (alias @/)
import { theme } from '@/src/theme/theme';                    // 4. Theme

import { mentorService } from '../services/mentorService';    // 5. Feature-local (relative)
import { MentorCard } from '../components/MentorCard';
```

- Uu tien alias `@/` cho moi thu ben ngoai feature hien tai
- Dung relative path `../` cho file cung feature
- Khong import truc tiep tu file trong feature cua nguoi khac (VD: khong import tu `src/features/booking/...` trong code cua feature `mentor`)

### Dat ten

| Loai | Convention | Vi du |
| --- | --- | --- |
| Route file | lowercase | `index.tsx`, `[id].tsx`, `dashboard.tsx` |
| Screen | PascalCase + Screen | `MentorListScreen.tsx` |
| Component | PascalCase | `MentorCard.tsx`, `Typography.tsx` |
| Service | camelCase + Service | `mentorService.ts` |
| Adapter | camelCase + Adapter | `mentorAdapter.ts` |
| Store | camelCase + Store | `bookingStore.ts` |
| Hook | camelCase + use prefix | `useBreakpoint.ts` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL`, `STORAGE_KEYS` |

---

## 7. Mock va backend integration

### Mock mode

- `src/core/config.ts` dieu khien `USE_MOCK` (hien tai `false`)
- Mock API nam trong `src/core/mocks/api/`
- Mock data nam trong `src/core/mocks/data/`
- Chat hien tai van mock-first qua `src/core/mocks/chatMocks.ts`

Khi viet service moi, PHAI ho tro ca 2 che do:

```tsx
const res = USE_MOCK
  ? await mockApi.getData()
  : await api.get<{ data: SomeDTO }>(`${BASE}/endpoint`);
const result = unwrap(res);
```

### Compatibility wrappers

Cac file trong `src/core/services/`, `src/core/store/`, `src/core/adapters/` chi la re-export wrappers:

```tsx
// src/core/services/userService.ts → chi 1 dong
export { userService } from '@/src/features/profile/services/userService';
```

**Khong them logic moi vao day.** Giu chung de import cu khong bi vo.

---

## 8. Checklist truoc khi commit

### Truoc khi bat dau code

- [ ] Da doc nhom file bat buoc (muc 2.2)
- [ ] Da xac dinh source of truth (muc 2.3)
- [ ] Da biet file nao khong nen vao
- [ ] Da biet cach verify sau khi sua

### Truoc khi commit / push

- [ ] `npm run lint` pass
- [ ] Khong pha route hien co (thu navigate qua man hinh chung quanh)
- [ ] Khong pha auth redirect (thu guest flow va logged-in flow)
- [ ] Khong hard-code mau/spacing/font (da dung theme tokens)
- [ ] Khong tao duplication (khong copy-paste tu screen khac)
- [ ] Khong de `console.log` debug con sot
- [ ] Khong sua file ngoai pham vi feature cua minh ma khong thong bao team
- [ ] Cap nhat tai lieu neu thay doi kien truc/route/source of truth

---

## 9. Quy trinh debug

Khi gap loi, debug theo thu tu:

```
1. Xac dinh noi loi bieu hien (screen, component, route)
2. Tim nguoc source of truth (route → screen → service → adapter → API)
3. Kiem tra du lieu dau vao (props, response, params)
4. Kiem tra dieu kien (role, auth state, USE_MOCK)
5. Chi sua khi co gia thuyet ro rang
6. Verify lai tren dung flow da gay ra loi
```

Phan loai nhanh:

| Trieu chung | Nguyen nhan thuong gap | Kiem tra |
| --- | --- | --- |
| Man hinh trang | Route entry sai, screen export sai | `app/` route file, screen export default |
| Data undefined | Service chua goi, adapter mapping sai | Service, adapter, `USE_MOCK` |
| Redirect loop | Auth guard logic | `_layout.tsx`, `authStore`, `isAuthenticated` |
| UI vo layout | Thieu responsive, hard-code size | theme tokens, responsive utils |
| 401 error | Token expired, refresh fail | `api.ts` interceptor, token storage |

---

## 10. Tieu chuan hoan thanh

Mot thay doi duoc xem la hoan thanh khi:

- [x] Giai quyet dung yeu cau ky thuat / nghiep vu
- [x] Nam dung lop trong kien truc (route / feature / core / theme)
- [x] Su dung shared component va theme tokens nhat quan
- [x] Khong tao source of truth kep (1 entity chi luu 1 noi)
- [x] Khong pha route, auth, role guard hoac responsive cua nguoi khac
- [x] `npm run lint` pass
- [x] Nguoi khac co the mo file va hieu y dinh ma khong phai doan
