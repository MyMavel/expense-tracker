#!/usr/bin/env bash
# สำรองฐานข้อมูลเป็นไฟล์ .sql.gz เก็บไว้ 14 วันล่าสุด
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
file="backups/expense-$(date +%Y%m%d-%H%M).sql.gz"
docker compose exec -T db pg_dump -U expense expense | gzip > "$file"
find backups -name 'expense-*.sql.gz' -mtime +14 -delete
echo "✅ สำรองข้อมูลแล้ว: $file"
