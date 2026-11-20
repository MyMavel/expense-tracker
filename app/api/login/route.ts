import { NextResponse } from "next/server";
import { checkPassword, sessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { bad, readJson } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await readJson(req);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // หน่วงเวลา กันการเดารหัสรัว ๆ
    return bad("รหัสผ่านไม่ถูกต้อง", 401);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true", // เปิดเป็น true เมื่อมี HTTPS แล้ว
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
