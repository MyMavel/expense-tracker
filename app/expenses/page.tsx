"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Expense } from "@/components/api";
import ExpenseForm, { type ExpenseInput } from "@/components/ExpenseForm";
import MonthPicker from "@/components/MonthPicker";
import { categoryOf } from "@/lib/categories";
import { baht, currentMonth, thaiDateLabel } from "@/lib/dates";

export default function ExpensesPage() {
  const [month, setMonth] = useState(currentMonth());
  const [items, setItems] = useState<Expense[] | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    // เรียก summary ก่อน เพื่อให้รายการประจำของเดือนนี้ถูกเพิ่มเข้ามา
    api(`/api/summary?month=${month}`)
      .then(() => api<Expense[]>(`/api/expenses?month=${month}`))
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [month]);

  useEffect(load, [load]);

  async function add(v: ExpenseInput) {
    await api("/api/expenses", { method: "POST", json: v });
    if (v.date.slice(0, 7) !== month) setMonth(v.date.slice(0, 7));
    else load();
  }

  async function update(id: number, v: ExpenseInput) {
    await api(`/api/expenses/${id}`, { method: "PUT", json: v });
    setEditing(null);
    load();
  }

  async function remove(e: Expense) {
    if (!confirm(`ลบรายการ ${categoryOf(e.category).label} ${baht(e.amount)} ?`)) return;
    try {
      await api(`/api/expenses/${e.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  // จัดกลุ่มตามวัน
  const groups = new Map<string, Expense[]>();
  for (const e of items ?? []) groups.set(e.date, [...(groups.get(e.date) ?? []), e]);

  return (
    <>
      <section className="card">
        <h2>เพิ่มรายจ่าย</h2>
        <ExpenseForm submitLabel="+ บันทึก" onSubmit={add} />
      </section>

      <MonthPicker month={month} onChange={setMonth} />
      {error && <p className="error">{error}</p>}
      {items === null && <p className="muted">กำลังโหลด…</p>}
      {items?.length === 0 && <p className="muted center">ยังไม่มีรายการในเดือนนี้</p>}

      {[...groups].map(([date, list]) => (
        <section key={date} className="card day-group">
          <div className="day-head">
            <strong>{thaiDateLabel(date)}</strong>
            <span>{baht(list.reduce((s, e) => s + e.amount, 0))}</span>
          </div>
          <ul className="exp-list">
            {list.map((e) => {
              const c = categoryOf(e.category);
              return editing === e.id ? (
                <li key={e.id} className="editing">
                  <ExpenseForm initial={e} submitLabel="บันทึกการแก้ไข" onSubmit={(v) => update(e.id, v)} onCancel={() => setEditing(null)} />
                </li>
              ) : (
                <li key={e.id}>
                  <span className="exp-icon" style={{ background: c.color }}>{c.icon}</span>
                  <div className="exp-main">
                    <span>{c.label}{e.recurring && <span className="tag">ประจำ</span>}</span>
                    {e.note && <small className="muted">{e.note}</small>}
                  </div>
                  <strong className="exp-amt">{baht(e.amount)}</strong>
                  <div className="exp-actions">
                    <button className="icon-btn" aria-label="แก้ไข" onClick={() => setEditing(e.id)}>✏️</button>
                    <button className="icon-btn" aria-label="ลบ" onClick={() => remove(e)}>🗑️</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
