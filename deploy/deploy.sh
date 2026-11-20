#!/usr/bin/env bash
# อัปเดตแอปบนเซิร์ฟเวอร์: ดึงโค้ดล่าสุดจาก GitHub แล้ว build + รันใหม่
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ ดึงโค้ดล่าสุด"
git pull --ff-only

echo "▶ build และรันใหม่"
docker compose up -d --build

echo "▶ ลบ image เก่าที่ไม่ใช้"
docker image prune -f

echo "▶ ตรวจสถานะ"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
    echo "✅ Deploy สำเร็จ"; exit 0
  fi
  sleep 2
done
echo "❌ แอปไม่ตอบสนอง ดู log ด้วย: docker compose logs app --tail 50"
exit 1
