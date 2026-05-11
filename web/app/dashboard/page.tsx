"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSkeletonData } from "@/hooks/useSkeletonData";
import { useRouterData } from "@/hooks/useRouterData";
import { SkeletonViewer3D } from "@/components/skeleton/SkeletonViewer3D";
import { AsciiSkeleton } from "@/components/skeleton/AsciiSkeleton";
import { SKELETON_CONNECTIONS } from "@/types/skeleton";
import {
  WifiOff,
  Terminal,
  RotateCw,
  Activity,
  Crosshair,
  Clock,
  Layers,
  Server,
  Zap,
  Radio,
  ArrowLeft,
  Monitor,
} from "lucide-react";

/* ── All styles — pure CSS, zero Tailwind ── */
const css = String.raw`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@700;800&family=Outfit:wght@500;600;700;800&display=swap');

  /* ── Resets ── */
  .dash-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: #020617;
    color: #e2e8f0;
    height: 100vh;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 16px 20px;
  }
  @media (min-width: 640px) { .dash-root { padding: 18px 28px; } }
  @media (min-width: 1024px) { .dash-root { padding: 20px 32px; } }

  /* ── Background Blobs ── */
  .dash-blob {
    position: absolute;
    filter: blur(120px);
    z-index: 0;
    opacity: 0.45;
    border-radius: 50%;
    pointer-events: none;
    animation: dashFloat 20s infinite alternate ease-in-out;
  }
  .dash-blob-1 { top: -15%; left: -10%; width: 500px; height: 500px; background: rgba(37,99,235,0.3); }
  .dash-blob-2 { bottom: -20%; right: -10%; width: 550px; height: 550px; background: rgba(14,165,233,0.2); animation-delay: -5s; }
  .dash-blob-3 { top: 40%; left: 50%; width: 420px; height: 420px; background: rgba(79,70,229,0.2); animation-delay: -10s; }
  @keyframes dashFloat {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(5%,10%) scale(1.1); }
    66%  { transform: translate(-5%,5%) scale(.9); }
    100% { transform: translate(0,-10%) scale(1.05); }
  }

  /* ── Layout wrapper ── */
  .dash-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }

  /* ── Glass panels ── */
  .glass {
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 4px 30px rgba(0,0,0,0.12);
    transition: background .3s, border-color .3s, box-shadow .3s, transform .3s;
  }
  .glass-hover:hover {
    background: rgba(30,41,59,0.65);
    border-color: rgba(59,130,246,0.25);
    box-shadow: 0 0 20px rgba(59,130,246,0.12);
    transform: translateY(-1px);
  }
  .glass-static {
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.05);
  }

  /* ── Header ── */
  .dash-header {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  @media (min-width: 1024px) {
    .dash-header { flex-direction: row; justify-content: space-between; align-items: center; }
  }
  .dash-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(51,65,85,0.5);
    color: #94a3b8;
    cursor: pointer;
    transition: all .3s;
    flex-shrink: 0;
    text-decoration: none;
  }
  .back-btn:hover { color: #22d3ee; border-color: rgba(34,211,238,0.3); }
  .back-btn svg { width: 20px; height: 20px; transition: transform .3s; }
  .back-btn:hover svg { transform: translateX(-3px); }

  .dash-title {
    font-family: 'Orbitron', sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    letter-spacing: 0.08em;
    background: linear-gradient(90deg, #22d3ee, #60a5fa, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1.2;
  }
  @media (min-width: 640px) { .dash-title { font-size: 1.75rem; } }
  @media (min-width: 1024px) { .dash-title { font-size: 2rem; } }

  .dash-subtitle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: #64748b;
    margin: 4px 0 0 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dash-subtitle-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #64748b;
    flex-shrink: 0;
  }

  .dash-header-btns {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .header-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(30,41,59,0.5);
    backdrop-filter: blur(8px);
    color: #cbd5e1;
    border: 1px solid rgba(51,65,85,0.6);
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all .3s;
    flex: 1;
  }
  @media (min-width: 1024px) { .header-btn { flex: none; } }
  .header-btn:hover { background: rgba(30,41,59,0.85); color: #22d3ee; border-color: rgba(34,211,238,0.4); }
  .header-btn svg { width: 16px; height: 16px; }
  .header-btn:hover .spin-icon { transform: rotate(180deg); transition: transform .5s; }

  /* ── Stats Bar ── */
  .stats-bar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .stat-card {
    flex: 1;
    min-width: 120px;
    padding: 10px 14px;
    border-radius: 12px;
  }
  .stat-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.6rem;
    color: #475569;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .stat-label svg { width: 12px; height: 12px; }
  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 0.82rem;
  }
  .stat-value-lg {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 1rem;
  }

  /* ── Main Grid ── */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }
  @media (min-width: 1024px) {
    .main-grid { grid-template-columns: 1fr 280px; }
  }
  @media (min-width: 1400px) {
    .main-grid { grid-template-columns: 1fr 320px; }
  }

  /* ── Visualizer Area ── */
  .viz-area {
    border-radius: 16px;
    border: 1px solid rgba(51,65,85,0.4);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }
  .viz-grid-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .viz-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    opacity: 0.7;
  }
  .viz-placeholder svg {
    width: 56px; height: 56px; color: #94a3b8;
    margin-bottom: 16px;
  }
  .viz-placeholder p {
    font-family: 'JetBrains Mono', monospace;
    color: #94a3b8;
    letter-spacing: 0.1em;
    font-size: 0.85rem;
    margin: 0;
  }

  .pulse-glow {
    animation: pulseGlow 2.5s ease-in-out infinite;
  }
  @keyframes pulseGlow {
    0%   { opacity: 0.5; transform: scale(0.95); }
    50%  { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 12px rgba(148,163,184,0.4)); }
    100% { opacity: 0.5; transform: scale(0.95); }
  }

  /* ── Right Sidebar ── */
  .sidebar { display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow-y: auto; }

  .panel-section {
    border-radius: 14px;
    padding: 16px;
    border: 1px solid rgba(51,65,85,0.4);
  }
  .panel-heading {
    font-family: 'Outfit', sans-serif;
    font-size: 0.75rem;
    color: #94a3b8;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .panel-heading svg { width: 15px; height: 15px; }

  /* ── Metrics Grid ── */
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .metric-cell {
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(30,41,59,0.8);
    border-radius: 10px;
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .metric-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.58rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .metric-value {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
  }
  .metric-unit {
    font-family: 'Inter', sans-serif;
    font-size: 0.5rem;
    color: #475569;
    margin-top: 1px;
  }

  /* ── Routers Panel ── */
  .routers-empty {
    flex: 1;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(30,41,59,0.7);
    border-radius: 10px;
    background: rgba(15,23,42,0.3);
  }
  .routers-empty p {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: #475569;
    text-align: center;
    padding: 0 16px;
    margin: 0;
  }
  .router-list { display: flex; flex-direction: column; gap: 8px; }
  .router-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(15,23,42,0.5);
    border: 1px solid rgba(30,41,59,0.7);
    border-radius: 10px;
    transition: border-color .3s;
  }
  .router-item:hover { border-color: rgba(59,130,246,0.3); }
  .router-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .router-info { flex: 1; }
  .router-name {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 0.82rem;
    color: #e2e8f0;
  }
  .router-bssid {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: #475569;
  }
  .router-status { text-align: right; }
  .router-status-text {
    font-size: 0.72rem;
    font-weight: 600;
  }
  .router-samples {
    font-size: 0.6rem;
    color: #475569;
  }

  /* ── Pose Info Panel ── */
  .pose-info {
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(51,65,85,0.4);
  }
  .pose-row {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: #94a3b8;
    margin-bottom: 6px;
  }
  .pose-row:last-child { margin-bottom: 0; }

  /* ── Mobile Compacting ── */
  @media (max-width: 1023px) {
    .dash-root { height: 100vh; overflow: hidden; }
    .dash-wrapper { gap: 10px; }
    .dash-header { gap: 8px; }
    .dash-title { font-size: 1.2rem; }
    .dash-subtitle { font-size: 0.6rem; margin-top: 2px; }
    .back-btn { width: 34px; height: 34px; border-radius: 10px; }
    .back-btn svg { width: 17px; height: 17px; }
    .header-btn { padding: 6px 12px; font-size: 0.75rem; }
    .stats-bar { gap: 8px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .stats-bar::-webkit-scrollbar { display: none; }
    .stat-card { min-width: 110px; padding: 8px 12px; flex-shrink: 0; border-radius: 10px; }
    .stat-label { font-size: 0.55rem; margin-bottom: 3px; }
    .stat-value { font-size: 0.75rem; }
    .stat-value-lg { font-size: 0.85rem; }
    .main-grid { gap: 10px; overflow: hidden; }
    .viz-area { min-height: 180px; border-radius: 12px; }
    .viz-placeholder svg { width: 36px; height: 36px; margin-bottom: 8px; }
    .viz-placeholder p { font-size: 0.72rem; }
    .sidebar { gap: 10px; overflow-y: auto; }
    .panel-section { padding: 12px; border-radius: 12px; }
    .panel-heading { font-size: 0.68rem; margin: 0 0 8px 0; }
    .panel-heading svg { width: 13px; height: 13px; }
    .metrics-grid { gap: 6px; }
    .metric-cell { padding: 8px 6px; border-radius: 8px; }
    .metric-label { font-size: 0.5rem; margin-bottom: 2px; }
    .metric-value { font-size: 0.95rem; }
    .routers-empty { min-height: 60px; }
    .routers-empty p { font-size: 0.65rem; }
    .pose-info { padding: 12px; border-radius: 12px; }
    .pose-row { font-size: 0.7rem; }
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #020617; }
  ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 4px; border: 1px solid #020617; }
  ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
`;

/* ── Color helper for status ── */
const STATUS_COLORS: Record<string, string> = {
  connected:    "#10b981",
  connecting:   "#f59e0b",
  disconnected: "#64748b",
  error:        "#ef4444",
};

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8765";

export default function DashboardPage() {
  const [wsUrl, setWsUrl]       = useState<string>(DEFAULT_WS_URL);
  const [viewMode, setViewMode] = useState<"3d" | "ascii">("3d");

  useEffect(() => {
    const saved = localStorage.getItem("sweenex_ws_url");
    if (saved) setWsUrl(saved);
  }, []);

  const { status, lastMessage, latency, send } = useWebSocket(wsUrl);
  const skeleton = useSkeletonData(lastMessage);
  const { routers, activeCount } = useRouterData(lastMessage);
  const hasKeypoints = skeleton.pose !== null && skeleton.pose.keypoints.length > 0;
  const keypoints   = skeleton.pose?.keypoints ?? [];
  const confidences = skeleton.pose?.confidences ?? [];

  const statusColor  = STATUS_COLORS[status] ?? "#64748b";
  const motionActive = skeleton.motion;
  const latencyColor = latency < 100 ? "#10b981" : latency < 300 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="dash-root">
        {/* Background blobs */}
        <div className="dash-blob dash-blob-1" aria-hidden />
        <div className="dash-blob dash-blob-2" aria-hidden />
        <div className="dash-blob dash-blob-3" aria-hidden />

        <div className="dash-wrapper">

          {/* ── HEADER ── */}
          <header className="dash-header">
            <div className="dash-header-left">
              <Link href="/" className="back-btn" title="Back to Home">
                <ArrowLeft />
              </Link>
              <div>
                <h1 className="dash-title">SWEENEX Dashboard</h1>
                <p className="dash-subtitle">
                  <span className="dash-subtitle-dot" />
                  WiFi-Based 3D Human Tracking v1.0 BETA
                </p>
              </div>
            </div>

            <div className="dash-header-btns">
              <button
                className="header-btn"
                onClick={() => setViewMode(viewMode === "3d" ? "ascii" : "3d")}
              >
                {viewMode === "3d" ? <Terminal /> : <Monitor />}
                {viewMode === "3d" ? "ASCII Mode" : "3D Mode"}
              </button>
              <button
                className="header-btn"
                onClick={() => send({ type: "get_status" })}
              >
                <RotateCw className="spin-icon" />
                Refresh
              </button>
            </div>
          </header>

          {/* ── TOP STATS BAR ── */}
          <div className="stats-bar">
            <div className="stat-card glass glass-hover">
              <div className="stat-label"><Server /> WebSocket</div>
              <div className="stat-value" style={{ color: statusColor }}>{status}</div>
            </div>
            <div className="stat-card glass glass-hover">
              <div className="stat-label"><Activity /> Motion</div>
              <div className="stat-value" style={{ color: motionActive ? "#10b981" : "#64748b" }}>
                {motionActive ? "DETECTED" : "idle"}
              </div>
            </div>
            <div className="stat-card glass glass-hover">
              <div className="stat-label"><Crosshair /> Score</div>
              <div className="stat-value-lg" style={{ color: "#22d3ee" }}>
                {skeleton.motionScore.toFixed(3)}
              </div>
            </div>
            <div className="stat-card glass glass-hover">
              <div className="stat-label"><Layers /> Frame</div>
              <div className="stat-value-lg" style={{ color: "#a78bfa" }}>
                {skeleton.frameId}
              </div>
            </div>
            <div className="stat-card glass glass-hover">
              <div className="stat-label"><Clock /> Latency</div>
              <div className="stat-value-lg" style={{ color: latencyColor }}>
                {latency}ms
              </div>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="main-grid">

            {/* Visualizer */}
            <div className="viz-area glass-static">
              <div className="viz-grid-pattern" />

              {!hasKeypoints && (
                <div className="viz-placeholder">
                  <WifiOff className="pulse-glow" />
                  <p>
                    {status === "connected"
                      ? motionActive
                        ? "Detecting pose..."
                        : "No motion detected"
                      : status === "connecting"
                      ? "Connecting to server..."
                      : "Server disconnected"}
                  </p>
                </div>
              )}

              {hasKeypoints && viewMode === "3d" && (
                <SkeletonViewer3D
                  keypoints={keypoints}
                  confidences={confidences}
                  connections={SKELETON_CONNECTIONS}
                  height={500}
                />
              )}

              {hasKeypoints && viewMode === "ascii" && (
                <div style={{ padding: 16, width: "100%" }}>
                  <AsciiSkeleton
                    keypoints={keypoints}
                    confidences={confidences}
                    connections={SKELETON_CONNECTIONS}
                  />
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="sidebar">

              {/* Metrics Panel */}
              <div className="panel-section glass">
                <h2 className="panel-heading">
                  <Zap style={{ color: "#f59e0b" }} /> Metrics
                </h2>
                <div className="metrics-grid">
                  <div className="metric-cell">
                    <span className="metric-label">FPS</span>
                    <span className="metric-value" style={{ color: skeleton.fps >= 10 ? "#10b981" : "#f59e0b" }}>
                      {skeleton.fps.toFixed(1)}
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Confidence</span>
                    <span className="metric-value" style={{ color: (skeleton.pose?.mean_confidence ?? 0) >= 0.5 ? "#10b981" : "#f59e0b" }}>
                      {((skeleton.pose?.mean_confidence ?? 0) * 100).toFixed(0)}
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>%</span>
                    </span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Routers</span>
                    <span className="metric-value" style={{ color: activeCount >= 2 ? "#10b981" : "#f59e0b" }}>
                      {activeCount}
                    </span>
                    <span className="metric-unit">active</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">RSSI</span>
                    <span className="metric-value" style={{ color: skeleton.rssi > -60 ? "#10b981" : "#f59e0b" }}>
                      {skeleton.rssi}
                    </span>
                    <span className="metric-unit">dBm</span>
                  </div>
                </div>
              </div>

              {/* Routers Panel */}
              <div className="panel-section glass" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <h2 className="panel-heading">
                  <Radio style={{ color: "#60a5fa" }} /> Routers
                </h2>
                {routers.length === 0 ? (
                  <div className="routers-empty">
                    <p>Waiting for routers to be detected...</p>
                  </div>
                ) : (
                  <div className="router-list">
                    {routers.map((r, i) => (
                      <div key={r.bssid} className="router-item">
                        <div
                          className="router-dot"
                          style={{ background: r.full ? "#10b981" : "#f59e0b" }}
                        />
                        <div className="router-info">
                          <div className="router-name">Router {i + 1}</div>
                          <div className="router-bssid">{r.bssid}</div>
                        </div>
                        <div className="router-status">
                          <div
                            className="router-status-text"
                            style={{ color: r.full ? "#10b981" : "#f59e0b" }}
                          >
                            {r.full ? "Active" : "Filling..."}
                          </div>
                          <div className="router-samples">
                            {r.samples}/100
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pose Info (when available) */}
              {skeleton.pose && (
                <div className="pose-info glass">
                  <h2 className="panel-heading">
                    <Crosshair style={{ color: "#a78bfa" }} /> Pose Info
                  </h2>
                  <div className="pose-row">
                    Confidence: {(skeleton.pose.mean_confidence * 100).toFixed(1)}%
                  </div>
                  {skeleton.pose.estimated_height_m && (
                    <div className="pose-row">
                      Est. Height: ~{(skeleton.pose.estimated_height_m * 100).toFixed(0)}cm
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
