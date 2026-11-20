import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCategory, TOTAL_BUDGET_KEY } from "@/lib/categories";
import { bad, readJson } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET → { "__total__": 15000, "food": 6000, ... }
export async function GET() {
  const sql = await db();
  const rows = await sql<{ category: string; amount: number }[]>`
    SELECT category, amount::float8 AS amount FROM budgets
  `;
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.category, r.amount])));
}

// PUT { "__total__": 15000, "food": 6000, "transport": 0 }  (0 หรือว่าง = ไม่ตั้งงบ)
export async function PUT(req: Request) {
  const body = await readJson(req);
  if (!body) return bad("ข้อมูลไม่ถูกต้อง");

  const entries: [string, number][] = [];
  for (const [key, raw] of Object.entries(body)) {
    if (key !== TOTAL_BUDGET_KEY && !isCategory(key)) return bad(`หมวดหมู่ไม่ถูกต้อง: ${key}`);
    const n = raw === "" || raw === null ? 0 : Number(raw);
    if (!Number.isFinite(n) || n < 0 || n >= 100_000_000) return bad("จำนวนงบไม่ถูกต้อง");
    entries.push([key, Math.round(n * 100) / 100]);
  }

  const sql = await db();
  await sql.begin(async (tx) => {
    for (const [category, amount] of entries) {
      if (amount === 0) {
        await tx`DELETE FROM budgets WHERE category = ${category}`;
      } else {
        await tx`
          INSERT INTO budgets (category, amount) VALUES (${category}, ${amount})
          ON CONFLICT (category) DO UPDATE SET amount = EXCLUDED.amount
        `;
      }
    }
  });
  return NextResponse.json({ ok: true });
}
