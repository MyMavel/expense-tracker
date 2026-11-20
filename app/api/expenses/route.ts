import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCategory } from "@/lib/categories";
import { currentMonth, isDate, isMonth, monthRange } from "@/lib/dates";
import { bad, parseAmount, parseNote, readJson } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/expenses?month=2026-11  → รายการทั้งหมดของเดือนนั้น
export async function GET(req: Request) {
  const m = new URL(req.url).searchParams.get("month") ?? currentMonth();
  if (!isMonth(m)) return bad("รูปแบบเดือนไม่ถูกต้อง");
  const { start, end } = monthRange(m);
  const sql = await db();
  const rows = await sql`
    SELECT id, amount::float8 AS amount, category, note, spent_on::text AS date,
           recurring_id IS NOT NULL AS recurring
    FROM expenses
    WHERE spent_on >= ${start} AND spent_on < ${end}
    ORDER BY spent_on DESC, id DESC
  `;
  return NextResponse.json(rows);
}

// POST /api/expenses  { amount, category, note, date }
export async function POST(req: Request) {
  const body = await readJson(req);
  const amount = parseAmount(body?.amount);
  if (amount === null) return bad("จำนวนเงินไม่ถูกต้อง");
  if (!isCategory(body?.category)) return bad("หมวดหมู่ไม่ถูกต้อง");
  if (!isDate(body?.date)) return bad("วันที่ไม่ถูกต้อง");

  const sql = await db();
  const [row] = await sql`
    INSERT INTO expenses (amount, category, note, spent_on)
    VALUES (${amount}, ${body.category}, ${parseNote(body.note)}, ${body.date})
    RETURNING id, amount::float8 AS amount, category, note, spent_on::text AS date, false AS recurring
  `;
  return NextResponse.json(row, { status: 201 });
}
