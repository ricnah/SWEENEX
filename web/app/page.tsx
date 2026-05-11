"use client";

import Link from "next/link";
import { Wifi, Activity, Zap, ArrowRight, Settings } from "lucide-react";

/* ── All styles in one CSS block (no Tailwind dependency) ── */
const css = String.raw`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@800&family=Outfit:wght@500;700;800&display=swap');

  /* ── Reset & Base ── */
  .landing-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: #020617;
    color: #e2e8f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 40px 20px;
  }

  /* ── Animated Background Blobs ── */
  .blob {
    position: absolute;
    filter: blur(120px);
    z-index: 0;
    opacity: 0.5;
    border-radius: 50%;
    pointer-events: none;
  }
  .blob-1 {
    top: -15%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: rgba(37, 99, 235, 0.35);
    animation: blobFloat 20s infinite alternate ease-in-out;
  }
  .blob-2 {
    bottom: -20%;
    right: -10%;
    width: 550px;
    height: 550px;
    background: rgba(14, 165, 233, 0.25);
    animation: blobFloat 20s -5s infinite alternate ease-in-out;
  }
  .blob-3 {
    top: 40%;
    left: 50%;
    width: 420px;
    height: 420px;
    background: rgba(79, 70, 229, 0.25);
    animation: blobCenter 20s -10s infinite alternate ease-in-out;
  }

  @keyframes blobFloat {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(5%, 10%) scale(1.1); }
    66%  { transform: translate(-5%, 5%) scale(0.9); }
    100% { transform: translate(0, -10%) scale(1.05); }
  }
  @keyframes blobCenter {
    0%   { transform: translate(-50%, -50%) scale(1); }
    33%  { transform: translate(-45%, -40%) scale(1.1); }
    66%  { transform: translate(-55%, -45%) scale(0.9); }
    100% { transform: translate(-50%, -60%) scale(1.05); }
  }

  /* ── Main Container ── */
  .landing-main {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* ── Logo Container ── */
  .logo-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(59, 130, 246, 0.15);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    margin-bottom: 28px;
    animation: logoFloat 6s ease-in-out infinite;
  }
  .logo-wrap svg {
    width: 56px;
    height: 56px;
  }
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* ── Brand Name ── */
  .brand-name {
    font-family: 'Orbitron', sans-serif;
    font-weight: 800;
    font-size: clamp(2.8rem, 7vw, 4.5rem);
    letter-spacing: 0.15em;
    background: linear-gradient(90deg, #60a5fa, #7dd3fc, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 20px 0;
    line-height: 1.1;
  }

  /* ── Subtitle Badge ── */
  .subtitle-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 18px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(14, 165, 233, 0.25);
    margin-bottom: 32px;
  }
  .subtitle-badge .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #38bdf8;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  .subtitle-badge span:last-child {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    color: #38bdf8;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  /* ── Description ── */
  .description {
    color: #94a3b8;
    font-size: clamp(0.95rem, 2.5vw, 1.1rem);
    max-width: 560px;
    margin: 0 auto 16px auto;
    line-height: 1.7;
  }
  .description-bold {
    display: block;
    margin-top: 6px;
    color: #cbd5e1;
    font-weight: 500;
    font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  }

  /* ── CTA Buttons ── */
  .cta-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 28px;
    margin-bottom: 56px;
    flex-wrap: wrap;
  }

  .btn-primary {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 30px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
    text-decoration: none;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
  }
  .btn-primary:hover {
    background: #3b82f6;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(37, 99, 235, 0.4);
  }
  .btn-primary:hover::after { transform: translateY(0); }
  .btn-primary span,
  .btn-primary .arrow-icon { position: relative; z-index: 1; }
  .btn-primary:hover .arrow-icon { transform: translateX(4px); }
  .arrow-icon { transition: transform 0.3s; display: flex; }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 30px;
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #94a3b8;
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s, color 0.3s, border-color 0.3s;
    text-decoration: none;
  }
  .btn-secondary:hover {
    background: rgba(30, 41, 59, 0.9);
    color: #e2e8f0;
    border-color: rgba(100, 116, 139, 0.7);
  }
  .btn-secondary .gear-icon { transition: transform 0.5s; display: flex; }
  .btn-secondary:hover .gear-icon { transform: rotate(90deg); }

  /* ── Features Grid ── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 100%;
  }
  @media (max-width: 700px) {
    .features-grid { grid-template-columns: 1fr; }
    .cta-row { flex-direction: column; }
    .btn-primary, .btn-secondary { width: 100%; }
  }

  .feature-card {
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 28px 24px;
    text-align: left;
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s;
  }
  .feature-card:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
    transform: translateY(-3px);
  }
  .feature-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(30, 58, 138, 0.4);
    border: 1px solid rgba(59, 130, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
  }
  .feature-icon-wrap svg {
    width: 22px;
    height: 22px;
    color: #60a5fa;
  }
  .feature-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #f1f5f9;
    margin: 0 0 8px 0;
  }
  .feature-desc {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
  }

  /* ── Entry animations ── */
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.8s forwards cubic-bezier(0.16, 1, 0.3, 1);
  }
  .d1 { animation-delay: 0.1s; }
  .d2 { animation-delay: 0.2s; }
  .d3 { animation-delay: 0.3s; }
  .d4 { animation-delay: 0.4s; }
  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #020617; }
  ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 4px; border: 1px solid #020617; }
  ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
`;

function SweenexLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wifi-grad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#60A5FA" />
          <stop offset="50%"  stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <g stroke="url(#wifi-grad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 20,35 C 30,15 70,15 80,35 L 50,55" />
        <path d="M 80,65 C 70,85 30,85 20,65 L 50,45" />
      </g>
    </svg>
  );
}

const features = [
  {
    icon: <Wifi />,
    title: "Multi-Router Setup",
    desc: "More routers equals higher precision and wider coverage area.",
  },
  {
    icon: <Activity />,
    title: "17 Keypoints",
    desc: "Full 3D skeleton tracking mapped with accurate XYZ coordinates.",
  },
  {
    icon: <Zap />,
    title: "<150ms Latency",
    desc: "Ultra-fast processing for seamless real-time tracking experience.",
  },
];

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="landing-root">
        {/* Background blobs */}
        <div className="blob blob-1" aria-hidden />
        <div className="blob blob-2" aria-hidden />
        <div className="blob blob-3" aria-hidden />

        <main className="landing-main">

          {/* Logo */}
          <div className="fade-up">
            <div className="logo-wrap">
              <SweenexLogo />
            </div>
          </div>

          {/* Brand */}
          <h1 className="brand-name fade-up">SWEENEX</h1>

          {/* Subtitle badge */}
          <div className="subtitle-badge fade-up d1">
            <span className="pulse-dot" />
            <span>WiFi-Based 3D Human Tracking</span>
          </div>

          {/* Description */}
          <p className="description fade-up d2">
            Real-time pose estimation using your home WiFi router signals.
            <span className="description-bold">
              No cameras. No wearables. Just ESP32 + WiFi.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="cta-row fade-up d3">
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button className="btn-primary" type="button">
                <span>Open Dashboard</span>
                <span className="arrow-icon"><ArrowRight size={18} /></span>
              </button>
            </Link>

            <Link href="/config" style={{ textDecoration: "none" }}>
              <button className="btn-secondary" type="button">
                <span className="gear-icon"><Settings size={18} /></span>
                Configure
              </button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="features-grid fade-up d4">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </>
  );
}