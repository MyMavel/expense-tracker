// วันที่ทั้งหมดคิดตามเวลาประเทศไทย (Asia/Bangkok)
const TZ = "Asia/Bangkok";

/** วันนี้ในรูปแบบ YYYY-MM-DD */
export function todayStr(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** เดือนนี้ในรูปแบบ YYYY-MM */
export function currentMonth(now = new Date()): string {
  return todayStr(now).slice(0, 7);
}

export function isMonth(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

export function isDate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(`${y}-${String(m).padStart(2, "0")}`);
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** วันแรกของเดือนถัดไป ใช้เป็นขอบบนของช่วงวันที่ (ไม่รวม) */
export function monthRange(month: string): { start: string; end: string } {
  return { start: `${month}-01`, end: `${shiftMonth(month, 1)}-01` };
}

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function thaiMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}

export function thaiDateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${THAI_MONTHS[m - 1].slice(0, 3)}. ${y + 543}`;
}

export function baht(n: number): string {
  return "฿" + n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
