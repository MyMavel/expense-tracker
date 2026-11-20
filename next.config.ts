import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // สร้างไฟล์สำหรับรันใน Docker แบบเล็กที่สุด
};

export default nextConfig;
