import { NextResponse } from "next/server";

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseAmount(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0 || n >= 10_000_000) return null;
  return Math.round(n * 100) / 100;
}

export function parseNote(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, 200) : "";
}

export function parseId(v: string): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}
