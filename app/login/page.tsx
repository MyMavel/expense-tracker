"use client";

import { useState } from "react";
import { api } from "@/components/api";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/login", { method: "POST", json: { password } });
      window.location.href = "/";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <h1>💰 บันทึกรายจ่าย</h1>
        <p className="muted">กรอกรหัสผ่านเพื่อเข้าใช้งาน</p>
        <input
          type="password" autoFocus required placeholder="รหัสผ่าน"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}</button>
      </form>
    </div>
  );
}
