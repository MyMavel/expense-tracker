"use client";

import { useState } from "react";
import { api } from "@/components/api";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

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
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"} autoFocus required placeholder="รหัสผ่าน"
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            title={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4,
            }}
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}</button>
      </form>
    </div>
  );
}
