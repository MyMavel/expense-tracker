const SYSTEMS = [
  {
    name: "ระบบศูนย์บ่มเพาะ OVEC-Startup",
    desc: "ศูนย์บ่มเพาะผู้ประกอบการอาชีวศึกษา",
    icon: "🚀",
    color: "#7c3aed", color2: "#c084fc",
    url: "https://startup.ovec.go.th/",
  },
  {
    name: "ระบบตรวจสอบวุฒิการศึกษา",
    desc: "ตรวจสอบและยืนยันวุฒิการศึกษา",
    icon: "🎓",
    color: "#0369a1", color2: "#38bdf8",
    url: "https://eca.ovec.go.th/",
  },
  {
    name: "OVEC Inter",
    desc: "ระบบงานด้านความร่วมมือระหว่างประเทศ",
    icon: "🌏",
    color: "#047857", color2: "#34d399",
    url: "https://inter.ovec.go.th/",
  },
  {
    name: "ระบบเทคโนโลยีสารสนเทศความปลอดภัยอาชีวศึกษา (Smart Safe)",
    desc: "ระบบสารสนเทศด้านความปลอดภัยในสถานศึกษาอาชีวศึกษา",
    icon: "🛡️",
    color: "#c2410c", color2: "#fb923c",
    url: "https://safeovec.ovec.go.th/",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <span className="hero-badge">OVEC • Online Systems</span>
        <h1>Dashboard <span>ระบบงาน</span></h1>
        <p>รวมทางเข้าระบบงานทั้งหมดไว้ในที่เดียว เลือกระบบที่ต้องการเข้าใช้งานได้ทันที</p>
      </section>
      <div className="portal-grid">
        {SYSTEMS.map((s) => (
          <a
            key={s.url}
            className="portal-card"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ "--c1": s.color, "--c2": s.color2 } as React.CSSProperties}
          >
            <span className="portal-icon" aria-hidden>{s.icon}</span>
            <h2>{s.name}</h2>
            <p>{s.desc}</p>
            <span className="portal-go">
              <span className="portal-url">{s.url.replace("https://", "").replace(/\/$/, "")}</span>
              <span className="portal-arrow" aria-hidden>→</span>
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
