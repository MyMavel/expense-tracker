import type postgres from "postgres";
import { currentMonth, daysInMonth, todayStr } from "./dates";

/**
 * เพิ่มรายการประจำ (เช่น ค่าเช่า ค่าเน็ต) ของเดือนนี้อัตโนมัติ
 * เมื่อถึงวันที่กำหนดแล้ว และเดือนนี้ยังไม่เคยเพิ่ม — เรียกทุกครั้งที่เปิดแอป
 */
export async function applyRecurring(sql: postgres.Sql): Promise<number> {
  const month = currentMonth();
  const today = Number(todayStr().slice(8, 10));
  const lastDay = daysInMonth(month);
  let added = 0;

  await sql.begin(async (tx) => {
    // FOR UPDATE ป้องกันการเพิ่มซ้ำถ้ามีคนเปิดแอปพร้อมกันหลายเครื่อง
    const due = await tx<{ id: number; amount: string; category: string; note: string; day_of_month: number }[]>`
      SELECT id, amount, category, note, day_of_month
      FROM recurring
      WHERE last_month IS DISTINCT FROM ${month}
      FOR UPDATE
    `;
    for (const r of due) {
      const day = Math.min(r.day_of_month, lastDay); // เช่น ตั้งวันที่ 31 แต่เดือนนี้มี 30 วัน
      if (today < day) continue;
      const date = `${month}-${String(day).padStart(2, "0")}`;
      await tx`
        INSERT INTO expenses (amount, category, note, spent_on, recurring_id)
        VALUES (${r.amount}, ${r.category}, ${r.note}, ${date}, ${r.id})
      `;
      await tx`UPDATE recurring SET last_month = ${month} WHERE id = ${r.id}`;
      added++;
    }
  });
  return added;
}
