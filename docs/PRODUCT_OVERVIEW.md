# Product Overview / Tong quan san pham

## Muc dich / Purpose

Tai lieu nay tom tat bai toan san pham, actor, muc tieu va nguyen tac cot loi cua `SocieDu Mobile - Mentor Marketplace App`.

## Doi tuong doc / Audience

- Product, BA, QA.
- Mobile va backend developers can nam duoc business context.
- Mentor/lead can align team truoc khi phan ra implementation.

## Nguon tham chieu / Sources

- `SYSTEM.md`.
- `PRD_v2_2_Data_Aligned.docx`.

## Noi dung chinh / Main content

### 1. Ten san pham va dinh vi

`SocieDu Mobile - Mentor Marketplace App` la ung dung mobile cho he thong Mentor Marketplace danh cho sinh vien. San pham tap trung vao giao dich dich vu tri thuc giua mentor va mentee, khong phai la cho tai lieu hoc tap va cung khong phai LMS day du.

### 2. Bai toan can giai quyet

Sinh vien hien thuong tim mentor qua cac kenh roi rac nhu Facebook, Discord, Telegram hoac gioi thieu ca nhan. Cac kenh nay gay ra cac van de:

- Ho so mentor khong duoc chuan hoa.
- Thieu minh bach ve gia, deliverables va cach lam viec.
- Khong co quy trinh booking, payment va dispute ro rang.
- Team van hanh khong co du dau vet de xu ly van de.

San pham huong toi viec bien qua trinh tim mentor, dat goi, thanh toan, trao doi va theo doi tien do thanh mot flow co cau truc.

### 3. Actor chinh

- `Buyer / Student / Mentee`: tim mentor, xem package, tao order, thanh toan, booking, nhan tin, report/dispute.
- `Mentor`: tao ho so mentor, tao service package, quan ly curriculum, theo doi booking session, phan hoi progress.
- `Admin / Moderator / Operations`: quan ly user, verification status, booking, payment, report, dispute va evidence.

### 4. Muc tieu san pham

#### Muc tieu nguoi dung / User goals

- Buyer tim duoc mentor phu hop va hieu ro gia tri goi dich vu truoc checkout.
- Mentor co mot profile chuyen nghiep va quy trinh nhan booking ro rang.
- Admin co du thong tin de dieu hanh va xu ly tranh chap.

#### Muc tieu kinh doanh / Business goals

- Tao GMV tu dich vu mentor.
- Tang conversion tu mentor detail sang booking.
- Xay nen tang de mo rong thanh marketplace mentor theo nhieu chu de va hanh trinh khac nhau.

#### Muc tieu van hanh / Operational goals

- Chuan hoa onboarding mentor.
- Chuan hoa booking, payment, session, messaging, report va dispute.
- Co du du lieu va trang thai de doi soat va xu ly van de trong MVP.

### 5. Nguyen tac san pham

- `Trust-first`: buyer phai hieu minh dang mua gi, cua ai va neu co van de thi xu ly the nao.
- `Clarity-before-checkout`: package, duration, deliverables va chinh sach lien quan phai ro truoc checkout.
- `In-platform communication first`: uu tien nhan tin trong nen tang de giam no-show va ho tro dispute.
- `Operationally manageable`: MVP phai co the van hanh duoc, khong phu thuoc vao qua nhieu quy trinh mo ho.
- `Data-aligned MVP`: chi cam ket day du cac nang luc da co data model ho tro.
- `Auditability by design`: cac thay doi quan trong nen co dau vet, du audit log day du co the de phase sau.

### 6. Dinh nghia MVP hien tai

Theo PRD v2.2 data-aligned, MVP hien tai duoc hieu la:

> Mentor Marketplace co package curriculum, order/payment, booking session, chat, report/dispute va progress report.

Dieu nay co nghia la phan product vision da ro hon phan implementation hien tai. App mobile chi moi bao phu mot phan trong dinh nghia MVP nay va con mot so module dang o muc mock hoac skeleton.

## Open questions / Known gaps

- He thong tong the co kha nang mo rong sang review, notification, payout va analytics, nhung nhung phan nay chua nen duoc xem la MVP da san sang.
- Trong repo mobile hien tai van con su pha tron giua ten `UniShare` va `SocieDu`; bo docs nay thong nhat cach goi `SocieDu Mobile - Mentor Marketplace App`.
