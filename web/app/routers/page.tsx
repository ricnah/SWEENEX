"use client";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRouterData } from "@/hooks/useRouterData";
import { useState, useEffect } from "react";
const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8765";
export default function RoutersPage() {
  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
  useEffect(() => {
    const s = localStorage.getItem("sweenex_ws_url");
    if (s) setWsUrl(s);
  }, []);
  const { status, lastMessage, send } = useWebSocket(wsUrl);
  const { routers, activeCount }      = useRouterData(lastMessage);
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0",
      fontFamily: "system-ui, sans-serif", padding: "32px",
    }}>
      <h1 style={{ color: "#00d4ff", marginBottom: "4px" }}>Router Manager</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "14px" }}>
        {activeCount} active router(s) — {status}
      </p>
      <button
        onClick={() => send({ type: "get_routers" })}
        style={{
          marginBottom: "20px", padding: "8px 16px",
          background: "#1e3a5f", border: "none", color: "#00d4ff",
          borderRadius: "6px", cursor: "pointer",
        }}
      >
        Refresh
      </button>
      {routers.length === 0 ? (
        <div style={{ color: "#334155", fontSize: "14px" }}>
          No routers detected. Make sure the server is running and ESP32 is connected.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {routers.map((r, i) => (
            <div key={r.bssid} style={{
              background:   "#0f172a",
              border:       `1px solid ${r.full ? "#10b981" : "#f59e0b"}44`,
              borderRadius: "10px",
              padding:      "14px 18px",
              display:      "flex",
              alignItems:   "center",
              gap:          "12px",
            }}>
              <div style={{
                width: "12px", height: "12px", borderRadius: "50%",
                background: r.full ? "#10b981" : "#f59e0b",
              }} />
              <div>
                <div style={{ fontWeight: "bold", color: "#e2e8f0" }}>
                  Router {i + 1}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                  {r.bssid}
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ color: r.full ? "#10b981" : "#f59e0b", fontSize: "13px" }}>
                  {r.full ? "Active" : "Filling..."}
                </div>
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {r.samples} / 100 samples
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
