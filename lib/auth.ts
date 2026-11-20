import { createHmac, timingSafeEqual } from "node:crypto";

// ระบบล็อกอินแบบง่าย: ใช้รหัสผ่านเดียวจาก APP_PASSWORD
// เมื่อล็อกอินสำเร็จ จะได้ cookie ที่เป็นลายเซ็น HMAC (ปลอมไม่ได้ถ้าไม่รู้ SESSION_SECRET)
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 วัน

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET ต้องยาวอย่างน้อย 16 ตัวอักษร");
  return s;
}

export function sessionToken(): string {
  return createHmac("sha256", secret())
    .update("expense-session:" + (process.env.APP_PASSWORD ?? ""))
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return false;
  return safeEqual(input, pw);
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    return safeEqual(token, sessionToken());
  } catch {
    return false;
  }
}
