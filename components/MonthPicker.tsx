"use client";

import { shiftMonth, thaiMonthLabel } from "@/lib/dates";

export default function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <div className="month-picker">
      <button aria-label="เดือนก่อน" onClick={() => onChange(shiftMonth(month, -1))}>‹</button>
      <strong>{thaiMonthLabel(month)}</strong>
      <button aria-label="เดือนถัดไป" onClick={() => onChange(shiftMonth(month, 1))}>›</button>
    </div>
  );
}
