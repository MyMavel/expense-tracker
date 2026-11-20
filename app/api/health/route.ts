import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ใช้ตรวจว่าแอปและฐานข้อมูลทำงานปกติ
export async function GET() {
  try {
    const sql = await db();
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
