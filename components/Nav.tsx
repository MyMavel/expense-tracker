"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "./api";

const LINKS = [
  { href: "/", label: "สรุป", icon: "📊" },
  { href: "/expenses", label: "รายการ", icon: "🧾" },
  { href: "/settings", label: "ตั้งค่า", icon: "⚙️" },
];

export default function Nav() {
  const path = usePathname();
  if (path === "/login") return null;

  async function logout() {
    await api("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">💰 บันทึกรายจ่าย</Link>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
              <span aria-hidden>{l.icon}</span> {l.label}
            </Link>
          ))}
          <button className="link-btn" onClick={logout}>ออกจากระบบ</button>
        </nav>
      </div>
    </header>
  );
}
