// หมวดหมู่แบบกำหนดไว้ล่วงหน้า (ผู้ใช้แก้ไขไม่ได้)
export const CATEGORIES = [
  { id: "food", label: "อาหาร", icon: "🍜", color: "#e8590c" },
  { id: "transport", label: "เดินทาง", icon: "🚌", color: "#1971c2" },
  { id: "household", label: "ของใช้ในบ้าน", icon: "🏠", color: "#2f9e44" },
  { id: "bills", label: "ค่าน้ำ/ไฟ/เน็ต", icon: "💡", color: "#f08c00" },
  { id: "health", label: "สุขภาพ", icon: "💊", color: "#c2255c" },
  { id: "shopping", label: "ช้อปปิ้ง", icon: "🛍️", color: "#7048e8" },
  { id: "entertainment", label: "บันเทิง", icon: "🎬", color: "#0c8599" },
  { id: "education", label: "การศึกษา", icon: "📚", color: "#5c940d" },
  { id: "other", label: "อื่น ๆ", icon: "📦", color: "#868e96" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as string[];

export function isCategory(v: unknown): v is CategoryId {
  return typeof v === "string" && CATEGORY_IDS.includes(v);
}

export function categoryOf(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

// งบรวมทั้งเดือนเก็บในตาราง budgets ด้วย key นี้
export const TOTAL_BUDGET_KEY = "__total__";
