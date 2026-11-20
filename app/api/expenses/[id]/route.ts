import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCategory } from "@/lib/categories";
import { isDate } from "@/lib/dates";
import { bad, parseAmount, parseId, parseNote, readJson } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/expenses/5  → แก้ไขรายการ
export async function PUT(req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return bad("ไม่พบรายการ", 404);
  const body = await readJson(req);
  const amount = parseAmount(body?.amount);
  if (amount === null) return bad("จำนวนเงินไม่ถูกต้อง");
  if (!isCategory(body?.category)) return bad("หมวดหมู่ไม่ถูกต้อง");
  if (!isDate(body?.date)) return bad("วันที่ไม่ถูกต้อง");

  const sql = await db();
  const [row] = await sql`
    UPDATE expenses
    SET amount = ${amount}, category = ${body.category}, note = ${parseNote(body.note)}, spent_on = ${body.date}
    WHERE id = ${id}
    RETURNING id, amount::float8 AS amount, category, note, spent_on::text AS date,
              recurring_id IS NOT NULL AS recurring
  `;
  return row ? NextResponse.json(row) : bad("ไม่พบรายการ", 404);
}

// DELETE /api/expenses/5  → ลบรายการ
export async function DELETE(_req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return bad("ไม่พบรายการ", 404);
  const sql = await db();
  const res = await sql`DELETE FROM expenses WHERE id = ${id}`;
  return res.count ? NextResponse.json({ ok: true }) : bad("ไม่พบรายการ", 404);
}
