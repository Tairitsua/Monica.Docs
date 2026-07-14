import type { Locale } from "@/content/home";

export function OpenGraphCard({ locale }: { locale: Locale }) {
  const chinese = locale === "zh-CN";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 76px",
        color: "#161713",
        background: "#f2eee5",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, color: "#b8f36b", background: "#161713", fontSize: 34, fontWeight: 800 }}>M</div>
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em" }}>monica</div>
        <div style={{ display: "flex", padding: "7px 10px", border: "2px solid #161713", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em" }}>1.0 RC</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: chinese ? 80 : 78, fontWeight: 750, letterSpacing: chinese ? "-0.04em" : "-0.055em", lineHeight: 0.98 }}>
        <div style={{ display: "flex" }}>{chinese ? "智能体可遵循的架构。" : "Architecture agents can follow."}</div>
        <div style={{ display: "flex", color: "#6841e8" }}>{chinese ? "人类可检查的系统。" : "Systems humans can inspect."}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 22, borderTop: "2px solid rgba(22,23,19,.25)", fontSize: 20 }}>
        <span>{chinese ? "面向 .NET 团队的可观测应用架构" : "Observable application architecture for .NET"}</span>
        <span style={{ color: "#4d771f", fontWeight: 700 }}>.NET 10 / MIT / OpenTelemetry</span>
      </div>
    </div>
  );
}
