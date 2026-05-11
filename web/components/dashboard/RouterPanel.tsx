"use client";
import { RouterInfo } from "@/types/skeleton";
interface Props {
  routers: RouterInfo[];
}
export function RouterPanel({ routers }: Props) {
  if (routers.length === 0) {
    return (
      <div style={{ color: "#6b7280", fontSize: "13px", padding: "8px" }}>
        Waiting for routers to be detected...
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
        {routers.length} active router(s)
      </div>
      {routers.map((r, i) => (
        <div key={r.bssid} style={{
          display:        "flex",
          alignItems:     "center",
          gap:            "8px",
          padding:        "4px 0",
          borderBottom:   "1px solid #1e293b",
          fontSize:       "13px",
        }}>
          <div style={{
            width:        "8px",
            height:       "8px",
            borderRadius: "50%",
            background:   r.full ? "#10b981" : "#f59e0b",
            flexShrink:   0,
          }} />
          <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>
            Router {i + 1}
          </span>
          <span style={{ color: "#64748b", fontSize: "11px", flexGrow: 1 }}>
            {r.bssid}
          </span>
          <span style={{ color: r.full ? "#10b981" : "#f59e0b", fontSize: "11px" }}>
            {r.samples}/{100} {r.full ? "✓" : "..."}
          </span>
        </div>
      ))}
    </div>
  );
}
