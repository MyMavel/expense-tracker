"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/api";
import { CATEGORIES, categoryOf, TOTAL_BUDGET_KEY } from "@/lib/categories";
import { baht } from "@/lib/dates";

type Recurring = { id: number; amount: number; category: string; note: string; day: number };

function BudgetSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<Record<string, number>>("/api/budgets").then((b) =>
      setValues(Object.fromEntries(Object.entries(b).map(([k, v]) => [k, String(v)]))),
    );
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const payload = Object.fromEntries(
      [TOTAL_BUDGET_KEY, ...CATEGORIES.map((c) => c.id)].map((k) => [k, values[k] ?? ""]),
    );
    try {
      await api("/api/budgets", { method: "PUT", json: payload });
      setMsg("✅ บันทึกงบประมาณแล้ว");
    } catch (err) {
      setMsg("❌ " + (err as Error).message);
    }
  }

  const field = (key: string, label: string) => (
    <label key={key} className="budget-field">
      <span>{label}</span>
      <input
        type="number" inputMode="decimal" min="0" step="1" placeholder="ไม่ตั้งงบ"
        value={values[key] ?? ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <section className="card">
      <h2>งบประมาณต่อเดือน</h2>
      <p className="muted">เว้นว่างไว้ถ้าไม่ต้องการตั้งงบหมวดนั้น</p>
      <form onSubmit={save}>
        {field(TOTAL_BUDGET_KEY, "💰 งบรวมทั้งเดือน")}
        <hr />
        {CATEGORIES.map((c) => field(c.id, `${c.icon} ${c.label}`))}
        <div className="form-actions">
          {msg && <span>{msg}</span>}
          <button className="btn primary">บันทึกงบ</button>
        </div>
      </form>
    </section>
  );
}

function RecurringSettings() {
  const [items, setItems] = useState<Recurring[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("bills");
  const [note, setNote] = useState("");
  const [day, setDay] = useState("1");
  const [error, setError] = useState("");

  const load = () => api<Recurring[]>("/api/recurring").then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/recurring", { method: "POST", json: { amount, category, note, day } });
      setAmount("");
      setNote("");
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(r: Recurring) {
    if (!confirm(`เลิกใช้รายการประจำ "${r.note || categoryOf(r.category).label}" ?\n(รายจ่ายที่บันทึกไปแล้วจะยังอยู่)`)) return;
    await api(`/api/recurring/${r.id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="card">
      <h2>รายจ่ายประจำทุกเดือน</h2>
      <p className="muted">ระบบจะเพิ่มให้อัตโนมัติเมื่อถึงวันที่กำหนด (ตอนเปิดแอป)</p>
      <form className="recurring-form" onSubmit={add}>
        <input type="text" placeholder="ชื่อ เช่น ค่าเน็ต" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        <input type="number" inputMode="decimal" min="0.01" step="0.01" required placeholder="จำนวนเงิน" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <label className="inline">
          ทุกวันที่
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {Array.from({ length: 31 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
          </select>
        </label>
        <button className="btn primary">+ เพิ่ม</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="exp-list">
        {items.map((r) => {
          const c = categoryOf(r.category);
          return (
            <li key={r.id}>
              <span className="exp-icon" style={{ background: c.color }}>{c.icon}</span>
              <div className="exp-main">
                <span>{r.note || c.label}</span>
                <small className="muted">ทุกวันที่ {r.day} · {c.label}</small>
              </div>
              <strong className="exp-amt">{baht(r.amount)}</strong>
              <div className="exp-actions">
                <button className="icon-btn" aria-label="ลบ" onClick={() => remove(r)}>🗑️</button>
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li className="muted">ยังไม่มีรายการประจำ</li>}
      </ul>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="grid-2">
      <BudgetSettings />
      <RecurringSettings />
    </div>
  );
}
