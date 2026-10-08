# VVRN — Drop 001

> English: [README.md](README.md)

ร้านเสื้อผ้า VVRN: หน้าเว็บ React + Tailwind, API ด้วย Node.js + TypeScript และฐานข้อมูล SQL Server

```
vvrn/
├── database/     สคริปต์ SQL สำหรับรันใน SSMS (สร้าง DB, ตาราง, ข้อมูลตัวอย่าง)
├── backend/      API: Express + TypeScript + mssql  (port 4000)
└── frontend/     หน้าเว็บ: Vite + React + TypeScript + Tailwind  (port 5173)
```

ตอนพัฒนา: เบราว์เซอร์ → `localhost:5173` (Vite) → ส่ง `/api/*` ต่อไปที่ `localhost:4000` (backend) → SQL Server

---

## สิ่งที่ต้องติดตั้ง

- **Node.js 20 ขึ้นไป** — https://nodejs.org
- **SQL Server** รุ่น Express หรือ Developer (ฟรี)
- **SSMS** (SQL Server Management Studio)

---

## 1. ตั้งค่าฐานข้อมูล

**1.1 เปิดให้ล็อกอินด้วย SQL Server login** (Node.js ใช้ Windows Authentication ไม่ได้)
SSMS → คลิกขวาที่ชื่อ server → **Properties** → **Security** → เลือก **SQL Server and Windows Authentication mode** → OK แล้ว restart SQL Server

**1.2 เปิด TCP/IP**
**SQL Server Configuration Manager** → SQL Server Network Configuration → Protocols for `<instance>` → **TCP/IP** → Enable แล้ว restart

**1.3 รันสคริปต์ใน SSMS ตามลำดับ** (File → Open → กด Execute)

| ไฟล์ | ทำอะไร |
|---|---|
| `database/00_create_database.sql` | สร้าง DB `VVRN` และ login `vvrn_app` — **แก้รหัสผ่านในไฟล์ก่อนรัน** |
| `database/01_schema.sql` | สร้างตารางทั้งหมด (รันซ้ำ = ลบข้อมูลทั้งหมดแล้วสร้างใหม่) |
| `database/02_seed.sql` | ใส่สินค้า 12 ชิ้นแรก สต็อกทุกสี/ไซส์ รีวิวตัวอย่าง โค้ด `VVRN10` และแถบโปรโมชัน |
| `database/10_more_products.sql` | เพิ่มสินค้าอีก 21 ชิ้น (เชิ้ต, ยีนส์, สแลค, รองเท้า, เข็มขัด, แว่น, เนกไท, ถุงเท้า, เสื้อกล้าม) |
| `database/11_sample_reviews.sql` | รีวิวตัวอย่างของสินค้าชุดใหม่ |

> `03`–`09` เป็นไฟล์อัปเดตสำหรับฐานข้อมูลเก่าเท่านั้น ติดตั้งใหม่ไม่ต้องรัน เพราะ `01_schema.sql` มีครบแล้ว

ตรวจสอบ: ผลลัพธ์ท้าย `02_seed.sql` ต้องแสดง Heavyweight Tee / Black / M = 11

---

## 2. รัน backend

```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

แก้ `backend/.env`:
- `DB_PASSWORD` ให้ตรงกับที่ตั้งในขั้น 1.3
- ถ้าติดตั้งแบบ **SQL Server Express** (instance ชื่อ `SQLEXPRESS`): ลบค่า `DB_PORT` แล้วใส่ `DB_INSTANCE=SQLEXPRESS` (ต้องเปิด service **SQL Server Browser** ด้วย)
- `JWT_SECRET` ใส่ข้อความสุ่มยาว ๆ สร้างได้ด้วย
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

```bash
npm run dev
```

เปิด http://localhost:4000/api/health ต้องเห็น `{"ok":true,"db":"connected"}`

---

## 3. รัน frontend (เปิดอีกหน้าต่าง terminal)

```bash
cd frontend
npm install
npm run dev
```

เปิด http://localhost:5173

---

## หลังบ้าน (หน้า Admin)

ผู้ใช้มี 3 role: `customer` (ค่าเริ่มต้น), `staff`, `admin` ทุกสิทธิ์ตรวจที่ backend

| ทำอะไรได้ | staff | admin |
|---|---|---|
| ดูออเดอร์ ดูสลิป อนุมัติสลิป เลื่อนสถานะ (paid → packed → shipped → delivered) | ✓ | ✓ |
| แก้สต็อก | ✓ | ✓ |
| ยกเลิกออเดอร์ (คืนสต็อกอัตโนมัติ ยกเลิกได้ก่อน shipped) | | ✓ |
| แก้ราคา / ซ่อน-แสดงสินค้า / เปลี่ยน role ผู้ใช้ | | ✓ |

**ตั้ง admin คนแรก**
1. ฐานข้อมูลเดิม: รัน `database/03_roles.sql` ใน SSMS (เพิ่มคอลัมน์ ไม่ลบข้อมูล)
2. สมัครบัญชีบนเว็บ แล้วรันใน SSMS: `UPDATE dbo.Users SET Role = 'admin' WHERE Email = N'อีเมลของคุณ';`
3. Refresh หน้าเว็บ จะเห็นเมนู **Admin** บน header (หรือเข้า http://localhost:5173/#/admin)

**อีเมลถึงลูกค้า** (ต้องรัน `database/04_email_outbox.sql` ก่อนถ้าเป็นฐานข้อมูลเดิม) ส่งตอนสั่งซื้อ และทุกครั้งที่เปลี่ยนสถานะ (paid, packed, shipped พร้อมเลขพัสดุ, delivered, cancelled)
- ทุกอีเมลบันทึกลงตาราง `EmailOutbox` ก่อนส่ง ส่งไม่ผ่านจะลองใหม่เอง (1, 5, 15, 60, 360 นาที) ดูสถานะและกด Retry / Send again ได้ในหน้า Admin
- ยังไม่ใส่ `RESEND_API_KEY` ใน `.env` → ไม่ส่งจริง บันทึกเป็นไฟล์ HTML ใน `backend/mail-outbox/` เปิดดูในเบราว์เซอร์ได้
- ส่งจริง: สมัคร https://resend.com เอา API key ใส่ `RESEND_API_KEY` แล้วรีสตาร์ต backend ถ้าใช้ `onboarding@resend.dev` จะส่งได้แค่อีเมลของบัญชี Resend เอง ต้อง verify โดเมนร้านแล้วเปลี่ยน `MAIL_FROM` ก่อนส่งหาลูกค้าจริง

คนต่อไปตั้งจากแท็บ Users ในหน้า Admin ได้เลย ทุกการเปลี่ยนสถานะจะบันทึกชื่อคนทำไว้ใน `OrderEvents.ChangedBy`

---

## API ทั้งหมด

| Method | Path | ใช้ทำอะไร |
|---|---|---|
| GET | `/api/health` | เช็กว่าต่อ DB ได้ |
| GET | `/api/products` | สินค้าทั้งหมด + สต็อก + คะแนนรีวิว + ยอดไลก์ |
| GET | `/api/products/:slug` | สินค้าชิ้นเดียว |
| GET / POST | `/api/products/:slug/reviews` | ดู / เขียนรีวิว (เฉพาะคนที่ซื้อแล้ว) |
| POST / DELETE | `/api/products/:slug/like` | กดใจ / เลิกกดใจ |
| POST | `/api/auth/register`, `/login`, `/logout` | สมัคร / เข้าสู่ระบบ / ออกจากระบบ |
| GET | `/api/auth/me` | ผู้ใช้ปัจจุบัน + ที่อยู่ที่บันทึกไว้ |
| POST | `/api/auth/forgot`, `/reset` | ลืมรหัสผ่าน (รหัส 6 หลัก หมดอายุ 15 นาที) |
| PUT / DELETE | `/api/me/address` | บันทึก / ลบที่อยู่ |
| POST | `/api/orders` | สั่งซื้อ (ตัดสต็อกใน transaction) |
| GET | `/api/orders/me` | ประวัติการสั่งซื้อ |
| GET | `/api/orders/track?no=&email=` | ติดตามออเดอร์ (ใช้ได้ทั้งสมาชิกและ guest) |

---

## แก้ปัญหาที่เจอบ่อย

| อาการ | วิธีแก้ |
|---|---|
| `Login failed for user 'vvrn_app'` | ยังไม่ได้เปิด SQL Server Authentication (ขั้น 1.1) หรือรหัสใน `.env` ไม่ตรง |
| `Failed to connect to localhost:1433` | TCP/IP ยังปิดอยู่ (ขั้น 1.2) หรือเป็น named instance ให้ใช้ `DB_INSTANCE` |
| `self-signed certificate` | ตั้ง `DB_ENCRYPT=false` และ `DB_TRUST_CERT=true` |
| หน้าเว็บขึ้น "Can't load the shop" | backend ไม่ได้รันอยู่ หรือต่อ DB ไม่ได้ ดู log ใน terminal ของ backend |
| ลืมรหัสผ่านแต่ไม่มีอีเมลส่งมา | ยังไม่ได้ต่อระบบอีเมล ตอนพัฒนารหัสจะแสดงบนหน้าเว็บและใน terminal ของ backend |

---

## ระบบที่ทำงานแล้ว

- **ราคาคำนวณที่ server เสมอ** ไม่เชื่อราคาจากเบราว์เซอร์
- **ตัดสต็อกแบบกันขายเกิน**: `UPDATE ... WHERE Stock >= @qty` ใน transaction เดียวกับการสร้างออเดอร์ ถ้าของไม่พอจะยกเลิกทั้งออเดอร์
- **รหัสผ่าน** เก็บเป็น bcrypt และล็อกอินด้วย cookie แบบ httpOnly (JavaScript อ่านไม่ได้)
- **ไม่ส่งเลขบัตรไปที่ server** ส่งแค่ยี่ห้อกับเลข 4 ตัวท้าย
- **สลิปโอนเงิน** เก็บใน `backend/uploads/slips` เปิดดูได้เฉพาะผ่าน admin API
- จำกัดจำนวนครั้งการล็อกอิน/สมัคร/ลืมรหัสผ่าน (30 ครั้งต่อ 15 นาที)

## ต้องทำก่อนเปิดขายจริง

1. **Payment gateway จริง** (Omise / Stripe): ตอนนี้ฝั่งบัตรเป็นโหมดทดสอบ ยังไม่ได้ตัดเงิน ให้ใช้ Omise.js สร้าง token ในหน้าเว็บ แล้วส่ง token ไปตัดเงินที่ backend ใน `routes/orders.ts` ส่วน QR ให้ใช้ PromptPay ของ Omise ที่ยืนยันการโอนผ่าน webhook
2. **อีเมล**: ยืนยันโดเมนกับ Resend แล้วตั้ง `MAIL_FROM` ลบ `MAIL_TEST_TO` ออกจาก `.env` (รหัสลืมรหัสผ่านยังไม่ได้ส่งทางอีเมล)
3. **HTTPS** และตั้ง `NODE_ENV=production` (cookie จะเป็น secure อัตโนมัติ)
4. ถ้า frontend กับ backend อยู่**คนละโดเมน** ต้องตั้ง `VITE_API_URL` และเปลี่ยน cookie เป็น `sameSite: "none"` ใน `middleware/auth.ts` หรือวางทั้งสองไว้หลังโดเมนเดียวกัน (แนะนำ)
5. **ลบรีวิวตัวอย่าง**: `DELETE FROM dbo.Reviews WHERE UserId IS NULL;`
6. ย้ายไฟล์สลิปไปเก็บบน cloud storage ถ้า deploy หลายเครื่อง
7. Frontend ปิด TypeScript strict ไว้ (`frontend/tsconfig.json`) เพราะ component ย้ายมาจาก JavaScript ค่อย ๆ เพิ่ม type ทีละไฟล์แล้วเปิด strict
