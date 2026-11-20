import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "บันทึกรายจ่าย",
  description: "แอปบันทึกรายจ่ายประจำวัน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f3a5f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
