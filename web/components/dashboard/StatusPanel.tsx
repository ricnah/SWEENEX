"use client";
import { WsStatus } from "@/hooks/useWebSocket";
interface Props {
  status:      WsStatus;
  motion:      boolean;
  motionScore: number;
  frameId:     number;
  latency:     number;
}
const STATUS_COLORS: Record<WsStatus, string> = {
  connected:    "#10b981",
  connecting:   "#f59e0b",
  disconnected: "#6b7280",
  error:        "#ef4444",
};
export function StatusPanel({ status, motion, motionScore, frameId, latency }: Props) {
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "12px 0" }}>
      <Chip
        label="WebSocket"
        value={status}
        color={STATUS_COLORS[status]}
      />
      <Chip
        label="Motion"
        value={motion ? "DETECTED" : "idle"}
        color={motion ? "#10b981" : "#6b7280"}
      />
      <Chip
        label="Score"
        value={motionScore.toFixed(3)}
        color="#0ea5e9"
      />
      <Chip
        label="Frame"
        value={frameId.toString()}
        color="#8b5cf6"
      />
      <Chip
        label="Latency"
        value={`${latency}ms`}
        color={latency < 100 ? "#10b981" : latency < 300 ? "#f59e0b" : "#ef4444"}
      />
    </div>
  );
}
function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: "#1e293b",
      border:     `1px solid ${color}44`,
      borderRadius: "8px",
      padding:    "6px 12px",
      minWidth:   "100px",
    }}>
      <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "14px", color, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
