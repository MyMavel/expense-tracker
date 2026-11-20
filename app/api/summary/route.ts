import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applyRecurring } from "@/lib/recurring";
import { currentMonth, daysInMonth, isMonth, monthRange, shiftMonth, todayStr } from "@/lib/dates";
import { bad } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET /api/summary?month=2026-11 → ข้อมูลทั้งหมดที่หน้าสรุปต้องใช้
export async function GET(req: Request) {
  const month = new URL(req.url).searchParams.get("month") ?? currentMonth();
  if (!isMonth(month)) return bad("รูปแบบเดือนไม่ถูกต้อง");

  const sql = await db();
  await applyRecurring(sql);

  const prev = shiftMonth(month, -1);
  const cur = monthRange(month);
  const old = monthRange(prev);
  const today = todayStr();

  const [byCat, prevByCat, daily, todayRow, budgets] = await Promise.all([
    sql<{ category: string; total: number }[]>`
      SELECT category, SUM(amount)::float8 AS total FROM expenses
      WHERE spent_on >= ${cur.start} AND spent_on < ${cur.end} GROUP BY category`,
    sql<{ category: string; total: number }[]>`
      SELECT category, SUM(amount)::float8 AS total FROM expenses
      WHERE spent_on >= ${old.start} AND spent_on < ${old.end} GROUP BY category`,
    sql<{ day: number; total: number }[]>`
      SELECT EXTRACT(DAY FROM spent_on)::int AS day, SUM(amount)::float8 AS total FROM expenses
      WHERE spent_on >= ${cur.start} AND spent_on < ${cur.end} GROUP BY day`,
    sql<{ total: number }[]>`
      SELECT COALESCE(SUM(amount), 0)::float8 AS total FROM expenses WHERE spent_on = ${today}`,
    sql<{ category: string; amount: number }[]>`SELECT category, amount::float8 AS amount FROM budgets`,
  ]);

  const days = daysInMonth(month);
  const dailyArr = Array.from({ length: days }, (_, i) => daily.find((d) => d.day === i + 1)?.total ?? 0);
  const sum = (rows: { total: number }[]) => rows.reduce((s, r) => s + r.total, 0);

  return NextResponse.json({
    month,
    prevMonth: prev,
    today,
    todayTotal: todayRow[0].total,
    monthTotal: sum(byCat),
    prevMonthTotal: sum(prevByCat),
    byCategory: Object.fromEntries(byCat.map((r) => [r.category, r.total])),
    prevByCategory: Object.fromEntries(prevByCat.map((r) => [r.category, r.total])),
    daily: dailyArr,
    budgets: Object.fromEntries(budgets.map((b) => [b.category, b.amount])),
  });
}
