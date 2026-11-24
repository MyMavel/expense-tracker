import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Nav from "@/components/Nav";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบงาน",
  description: "Dashboard ระบบงาน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f3a5f",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authed = isValidSession((await cookies()).get(SESSION_COOKIE)?.value);
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&family=Sarabun:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Nav authed={authed} />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
