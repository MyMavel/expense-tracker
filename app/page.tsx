"use client";

import { useEffect, useState } from "react";
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { api } from "@/components/api";
import MonthPicker from "@/components/MonthPicker";
import { CATEGORIES, TOTAL_BUDGET_KEY } from "@/lib/categories";
import { baht, currentMonth, thaiMonthLabel } from "@/lib/dates";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
ChartJS.defaults.font.family = "Sarabun, sans-serif";

type Summary = {
  month: string;
  prevMonth: string;
  todayTotal: number;
  monthTotal: number;
  prevMonthTotal: number;
  byCategory: Record<string, number>;
  prevByCategory: Record<string, number>;
  daily: number[];
  budgets: Record<string, number>;
};

function BudgetBar({ label, spent, budget }: { label: string; spent: number; budget: number }) {
  const pct = Math.min(100, (spent / budget) * 100);
  const state = spent > budget ? "over" : pct >= 80 ? "warn" : "ok";
  return (
    <div className="budget-row">
      <div className="budget-head">
        <span>{label}</span>
        <span className={"budget-num " + state}>
          {baht(spent)} / {baht(budget)}
        </span>
      </div>
      <div className="bar"><div className={"bar-fill " + state} style={{ width: pct + "%" }} /></div>
      <small className="muted">
        {spent > budget ? `เกินงบ ${baht(spent - budget)}` : `เหลือ ${baht(budget - spent)}`}
      </small>
    </div>
  );
}

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api<Summary>(`/api/summary?month=${month}`).then(setData).catch((e) => setError(e.message));
  }, [month]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">กำลังโหลด…</p>;

  const isThisMonth = month === currentMonth();
  const diff = data.monthTotal - data.prevMonthTotal;
  const usedCats = CATEGORIES.filter((c) => data.byCategory[c.id] || data.prevByCategory[c.id]);
  const catBudgets = CATEGORIES.filter((c) => data.budgets[c.id]);
  const totalBudget = data.budgets[TOTAL_BUDGET_KEY];

  return (
    <>
      <MonthPicker month={month} onChange={setMonth} />

      <section className="stats">
        {isThisMonth && (
          <div className="card stat">
            <span className="muted">วันนี้</span>
            <strong>{baht(data.todayTotal)}</strong>
          </div>
        )}
        <div className="card stat">
          <span className="muted">ทั้งเดือน</span>
          <strong>{baht(data.monthTotal)}</strong>
        </div>
        <div className="card stat">
          <span className="muted">เทียบ{thaiMonthLabel(data.prevMonth).split(" ")[0]}</span>
          <strong className={diff > 0 ? "up" : "down"}>
            {diff === 0 ? "เท่าเดิม" : (diff > 0 ? "▲ " : "▼ ") + baht(Math.abs(diff))}
          </strong>
          <small className="muted">เดือนก่อน {baht(data.prevMonthTotal)}</small>
        </div>
      </section>

      {(totalBudget || catBudgets.length > 0) && (
        <section className="card">
          <h2>งบประมาณ</h2>
          {totalBudget && <BudgetBar label="งบรวมทั้งเดือน" spent={data.monthTotal} budget={totalBudget} />}
          {catBudgets.map((c) => (
            <BudgetBar key={c.id} label={`${c.icon} ${c.label}`} spent={data.byCategory[c.id] ?? 0} budget={data.budgets[c.id]} />
          ))}
        </section>
      )}

      {data.monthTotal === 0 ? (
        <section className="card empty">
          <p>ยังไม่มีรายจ่ายในเดือนนี้</p>
          <a className="btn primary" href="/expenses">+ เพิ่มรายจ่าย</a>
        </section>
      ) : (
        <div className="grid-2">
          <section className="card">
            <h2>สัดส่วนตามหมวด</h2>
            <div className="chart-box">
              <Doughnut
                data={{
                  labels: CATEGORIES.filter((c) => data.byCategory[c.id]).map((c) => c.label),
                  datasets: [{
                    data: CATEGORIES.filter((c) => data.byCategory[c.id]).map((c) => data.byCategory[c.id]),
                    backgroundColor: CATEGORIES.filter((c) => data.byCategory[c.id]).map((c) => c.color),
                    borderWidth: 2,
                  }],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${baht(ctx.parsed)}` } },
                  },
                }}
              />
            </div>
          </section>
          <section className="card">
            <h2>รายจ่ายรายวัน</h2>
            <div className="chart-box">
              <Bar
                data={{
                  labels: data.daily.map((_, i) => String(i + 1)),
                  datasets: [{ label: "บาท", data: data.daily, backgroundColor: "#1f3a5f", borderRadius: 4 }],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { title: (i) => `วันที่ ${i[0].label}`, label: (ctx) => baht(ctx.parsed.y ?? 0) } },
                  },
                  scales: { x: { grid: { display: false } } },
                }}
              />
            </div>
          </section>
        </div>
      )}

      {usedCats.length > 0 && (
        <section className="card">
          <h2>เทียบกับเดือนก่อน (แยกหมวด)</h2>
          <table className="compare">
            <thead>
              <tr><th>หมวด</th><th>เดือนก่อน</th><th>เดือนนี้</th><th>ต่าง</th></tr>
            </thead>
            <tbody>
              {usedCats.map((c) => {
                const now = data.byCategory[c.id] ?? 0;
                const before = data.prevByCategory[c.id] ?? 0;
                const d = now - before;
                return (
                  <tr key={c.id}>
                    <td>{c.icon} {c.label}</td>
                    <td>{baht(before)}</td>
                    <td>{baht(now)}</td>
                    <td className={d > 0 ? "up" : d < 0 ? "down" : ""}>
                      {d === 0 ? "–" : (d > 0 ? "+" : "−") + baht(Math.abs(d))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
