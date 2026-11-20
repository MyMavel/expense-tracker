"use client";

export type Expense = {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
  recurring: boolean;
};

// ตัวช่วยเรียก API: ถ้า error จะโยนข้อความภาษาไทยจาก server ออกมา
export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    cache: "no-store",
  });
  if (res.status === 401 && !url.includes("/api/login")) {
    window.location.href = "/login";
    throw new Error("กรุณาเข้าสู่ระบบ");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
  return data as T;
}
