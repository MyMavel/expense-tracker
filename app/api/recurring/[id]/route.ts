import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bad, parseId } from "@/lib/validate";

type Ctx = { params: Promise<{ id: string }> };

// ลบรายการประจำ (รายจ่ายที่เคยเพิ่มไปแล้วยังอยู่ครบ)
export async function DELETE(_req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return bad("ไม่พบรายการ", 404);
  const sql = await db();
  const res = await sql`DELETE FROM recurring WHERE id = ${id}`;
  return res.count ? NextResponse.json({ ok: true }) : bad("ไม่พบรายการ", 404);
}
