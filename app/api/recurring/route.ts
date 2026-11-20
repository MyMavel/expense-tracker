import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCategory } from "@/lib/categories";
import { applyRecurring } from "@/lib/recurring";
import { bad, parseAmount, parseNote, readJson } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = await db();
  const rows = await sql`
    SELECT id, amount::float8 AS amount, category, note, day_of_month AS day, last_month AS "lastMonth"
    FROM recurring ORDER BY day_of_month, id
  `;
  return NextResponse.json(rows);
}

// POST { amount, category, note, day }  → day = วันที่ของเดือน (1–31)
export async function POST(req: Request) {
  const body = await readJson(req);
  const amount = parseAmount(body?.amount);
  const day = Number(body?.day);
  if (amount === null) return bad("จำนวนเงินไม่ถูกต้อง");
  if (!isCategory(body?.category)) return bad("หมวดหมู่ไม่ถูกต้อง");
  if (!Number.isInteger(day) || day < 1 || day > 31) return bad("วันที่ต้องอยู่ระหว่าง 1–31");

  const sql = await db();
  const [row] = await sql`
    INSERT INTO recurring (amount, category, note, day_of_month)
    VALUES (${amount}, ${body.category}, ${parseNote(body.note)}, ${day})
    RETURNING id
  `;
  await applyRecurring(sql); // ถ้าวันที่กำหนดผ่านมาแล้วในเดือนนี้ จะเพิ่มให้ทันที
  return NextResponse.json(row, { status: 201 });
}
