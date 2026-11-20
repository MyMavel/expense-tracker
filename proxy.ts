import { NextResponse, type NextRequest } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

// ด่านตรวจก่อนเข้าทุกหน้า: ถ้ายังไม่ล็อกอินให้ไปหน้า /login
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname === "/api/login" || pathname === "/api/health") {
    return NextResponse.next();
  }

  if (isValidSession(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // ไม่ต้องตรวจไฟล์ static
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
