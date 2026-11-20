# 💰 บันทึกรายจ่าย (Expense Tracker)

เว็บแอปบันทึกรายจ่ายประจำวันแบบ Full Stack ใช้ **Next.js + PostgreSQL** รันด้วย **Docker** บนเซิร์ฟเวอร์ Ubuntu

**ฟีเจอร์**
- เพิ่ม แก้ไข และลบรายจ่าย แยก 9 หมวด
- หน้าสรุป: ยอดวันนี้ ยอดทั้งเดือน กราฟสัดส่วนตามหมวด กราฟรายวัน และเทียบกับเดือนก่อน
- งบประมาณรายเดือน ทั้งงบรวมและงบแยกหมวด (เตือนเมื่อใช้ไป 80% และเมื่อเกินงบ)
- รายจ่ายประจำ (เช่น ค่าเน็ต ค่าเช่า) ระบบเพิ่มให้อัตโนมัติเมื่อถึงวันที่กำหนด
- ล็อกอินด้วยรหัสผ่าน ใช้ได้ทั้งมือถือและคอม ข้อมูลตรงกันทุกเครื่อง

---

## โครงสร้างโปรเจกต์

```
app/            หน้าเว็บ (/, /expenses, /settings, /login) และ API (app/api/*)
components/     ส่วนประกอบ UI ที่ใช้ซ้ำ
lib/            ฐานข้อมูล ระบบล็อกอิน หมวดหมู่ และฟังก์ชันวันที่
proxy.ts        ตรวจการล็อกอินก่อนเข้าทุกหน้า
deploy/         ไฟล์ Nginx, สคริปต์ deploy และสคริปต์สำรองข้อมูล
Dockerfile, docker-compose.yml   ใช้รันบนเซิร์ฟเวอร์
.github/workflows/deploy.yml     push แล้ว deploy อัตโนมัติ
```

ตารางในฐานข้อมูลจะถูกสร้างอัตโนมัติตอนเปิดแอปครั้งแรก ไม่ต้องสร้างเอง

---

## ขั้นที่ 1: อัปโหลดขึ้น GitHub (ทำบนคอมของคุณ)

1. ไปที่ https://github.com/new แล้วสร้าง repository ชื่อ `expense-tracker`
   - เลือก **Public** จะง่ายที่สุด (โค้ดไม่มีรหัสผ่านใด ๆ เพราะไฟล์ `.env` ไม่ถูกอัปโหลด)
   - ถ้าเลือก **Private** ให้ดูหัวข้อ "ถ้า repo เป็น Private" ด้านล่างเพิ่มเติม
   - **ไม่ต้อง**ติ๊กสร้าง README
2. แตกไฟล์ zip แล้วเปิด PowerShell ในโฟลเดอร์ `expense-app`:

```powershell
git init
git add .
git commit -m "เริ่มโปรเจกต์บันทึกรายจ่าย"
git branch -M main
git remote add origin https://github.com/<ชื่อผู้ใช้>/expense-tracker.git
git push -u origin main
```

ถ้ายังไม่มี Git ให้ติดตั้งจาก https://git-scm.com/download/win ก่อน ถ้าเป็นการใช้ Git ครั้งแรก ให้ตั้งชื่อและอีเมลด้วย `git config --global user.name "ชื่อ"` และ `git config --global user.email "อีเมล"`

---

## ขั้นที่ 2: ติดตั้งบนเซิร์ฟเวอร์ (ครั้งแรกครั้งเดียว)

SSH เข้าเซิร์ฟเวอร์ (`ssh kittithat@45.136.253.203`) แล้วรัน:

```bash
# 1) ดึงโค้ดมาไว้ที่ ~/expense-tracker
cd ~
git clone https://github.com/<ชื่อผู้ใช้>/expense-tracker.git
cd expense-tracker

# 2) สร้างไฟล์ .env และใส่ค่าสุ่ม
cp .env.example .env
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "SESSION_SECRET=$(openssl rand -hex 32)"
nano .env
```

ใน `nano` ให้ทำดังนี้:
- นำค่าที่สุ่มได้จากคำสั่ง `echo` ไปใส่ที่ `POSTGRES_PASSWORD` และ `SESSION_SECRET`
- ตั้ง `APP_PASSWORD` เป็นรหัสที่จะใช้ล็อกอินเข้าแอป
- บรรทัด `DATABASE_URL` ไม่ต้องแก้ (บนเซิร์ฟเวอร์ไม่ได้ใช้)

แล้วกด `Ctrl+O` → `Enter` เพื่อบันทึก และ `Ctrl+X` เพื่อออก

```bash
chmod 600 .env        # ให้อ่านได้เฉพาะเรา

# 3) build และรันแอป (ครั้งแรกใช้เวลา 2–4 นาที)
docker compose up -d --build
docker compose ps     # ต้องเห็น app และ db สถานะ running / healthy
curl http://127.0.0.1:3000/api/health   # ต้องได้ {"ok":true}

# 4) ตั้ง Nginx ให้ส่งต่อไปที่แอป
sudo cp deploy/nginx.conf /etc/nginx/sites-available/expense
sudo ln -s /etc/nginx/sites-available/expense /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

เปิดเบราว์เซอร์ไปที่ **http://45.136.253.203** จะเห็นหน้าล็อกอิน 🎉

---

## ขั้นที่ 3: ให้ push แล้ว deploy อัตโนมัติ (GitHub Actions)

**3.1 สร้างกุญแจสำหรับ GitHub บนเซิร์ฟเวอร์**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N "" -C "github-actions"
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions          # คัดลอกข้อความทั้งหมดที่แสดง (รวมบรรทัด BEGIN/END)
```

**3.2 ใส่ Secrets ใน GitHub**

ไปที่ repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** แล้วเพิ่ม 3 ค่า:

| Name | Value |
|---|---|
| `SERVER_HOST` | `45.136.253.203` |
| `SERVER_USER` | `kittithat` |
| `SSH_PRIVATE_KEY` | ข้อความที่คัดลอกจากข้อ 3.1 |

ตั้งแต่นี้ไป ทุกครั้งที่ `git push` ขึ้น `main` ระบบจะ build ทดสอบ แล้ว deploy ขึ้นเซิร์ฟเวอร์ให้เอง ดูความคืบหน้าได้ที่แท็บ **Actions** ของ repo

---

## การใช้งานประจำ

```bash
cd ~/expense-tracker
docker compose logs app --tail 50 -f   # ดู log (Ctrl+C เพื่อออก)
docker compose restart app             # รีสตาร์ทแอป
bash deploy/deploy.sh                   # deploy เองโดยไม่ผ่าน GitHub Actions
bash deploy/backup.sh                   # สำรองฐานข้อมูลไปที่ backups/
```

**ตั้งให้สำรองข้อมูลทุกคืนตอนตี 3:**

```bash
crontab -e
# เพิ่มบรรทัดนี้ที่ท้ายไฟล์:
0 3 * * * bash /home/kittithat/expense-tracker/deploy/backup.sh >> /home/kittithat/backup.log 2>&1
```

**กู้คืนข้อมูลจากไฟล์สำรอง:**

```bash
gunzip -c backups/expense-YYYYMMDD-HHMM.sql.gz | docker compose exec -T db psql -U expense expense
```

---

## เมื่อมีโดเมนแล้ว (เพิ่ม HTTPS)

1. ที่ผู้ให้บริการโดเมน ตั้ง **A record** ชี้ไปที่ `45.136.253.203`
2. แก้ `server_name _;` ใน `/etc/nginx/sites-available/expense` เป็นชื่อโดเมน แล้วรัน `sudo systemctl reload nginx`
3. ขอ SSL ด้วย `sudo certbot --nginx -d โดเมนของคุณ`
4. แก้ `.env` ให้ `COOKIE_SECURE=true` แล้วรัน `docker compose up -d`

---

## รันบนเครื่องตัวเอง (สำหรับพัฒนา)

ต้องมี Node.js 22 และ PostgreSQL ที่ใช้งานได้ (ติดตั้งเองหรือใช้ Docker Desktop):

```bash
docker run -d --name pg -e POSTGRES_USER=expense -e POSTGRES_PASSWORD=change-me -e POSTGRES_DB=expense -p 5432:5432 postgres:16-alpine
cp .env.example .env     # ตั้ง APP_PASSWORD และ SESSION_SECRET
npm install
npm run dev              # เปิด http://localhost:3000
```

---

## ถ้า repo เป็น Private

เซิร์ฟเวอร์ต้องมีกุญแจเพื่ออ่าน repo ก่อน `git clone`:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_repo -N "" -C "server-deploy-key"
cat ~/.ssh/github_repo.pub
printf 'Host github.com\n  IdentityFile ~/.ssh/github_repo\n' >> ~/.ssh/config
```

นำข้อความที่แสดงไปใส่ที่ repo → **Settings** → **Deploy keys** → **Add deploy key** (ไม่ต้องติ๊ก write access) จากนั้น clone ด้วยลิงก์แบบ SSH:

```bash
git clone git@github.com:<ชื่อผู้ใช้>/expense-tracker.git
```
"# expense-tracker" 
