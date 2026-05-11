"use client";
interface Props {
  fps:         number;
  confidence:  number;
  activeRouters: number;
  rssi:        number;
}
export function MetricsPanel({ fps, confidence, activeRouters, rssi }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
      <Metric label="FPS"          value={fps.toFixed(1)}       unit=""     good={fps >= 10} />
      <Metric label="Confidence"   value={(confidence * 100).toFixed(0)} unit="%" good={confidence >= 0.5} />
      <Metric label="Routers"      value={activeRouters.toString()} unit="active" good={activeRouters >= 2} />
      <Metric label="RSSI"         value={rssi.toString()}      unit="dBm"  good={rssi > -60} />
    </div>
  );
}
function Metric({ label, value, unit, good }: {
  label: string; value: string; unit: string; good: boolean;
}) {
  return (
    <div style={{
      background:   "#1e293b",
      borderRadius: "8px",
      padding:      "10px",
      textAlign:    "center",
    }}>
      <div style={{ fontSize: "10px", color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "bold", color: good ? "#10b981" : "#f59e0b" }}>
        {value}
      </div>
      {unit && <div style={{ fontSize: "10px", color: "#475569" }}>{unit}</div>}
    </div>
  );
}
