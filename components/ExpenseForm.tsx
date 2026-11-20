"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { todayStr } from "@/lib/dates";
import type { Expense } from "./api";

export type ExpenseInput = { amount: string; category: string; note: string; date: string };

export default function ExpenseForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Expense;
  submitLabel: string;
  onSubmit: (v: ExpenseInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "food");
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(initial?.date ?? todayStr());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({ amount, category, note, date });
      if (!initial) {
        setAmount("");
        setNote("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={submit}>
      <label>
        จำนวนเงิน (บาท)
        <input
          type="number" inputMode="decimal" step="0.01" min="0.01" required
          value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          autoFocus={!initial}
        />
      </label>
      <label>
        วันที่
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <fieldset className="cat-grid">
        <legend>หมวดหมู่</legend>
        {CATEGORIES.map((c) => (
          <button
            type="button" key={c.id}
            className={"cat-chip" + (category === c.id ? " selected" : "")}
            style={{ "--cat": c.color } as React.CSSProperties}
            onClick={() => setCategory(c.id)}
          >
            <span aria-hidden>{c.icon}</span> {c.label}
          </button>
        ))}
      </fieldset>
      <label className="full">
        บันทึกเพิ่มเติม (ไม่บังคับ)
        <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ข้าวมันไก่" />
      </label>
      {error && <p className="error full">{error}</p>}
      <div className="form-actions full">
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>ยกเลิก</button>}
        <button className="btn primary" disabled={busy}>{busy ? "กำลังบันทึก…" : submitLabel}</button>
      </div>
    </form>
  );
}
