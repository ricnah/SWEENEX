"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Server, Save, CheckCircle2 } from "lucide-react";

/* ── All styles in one CSS block (no Tailwind dependency) ── */
const css = String.raw`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@800&family=Outfit:wght@500;700;800&display=swap');

  /* ── Reset & Base ── */
  .config-root {
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
  .config-main {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .config-panel {
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    padding: 32px;
    display: flex;
    flex-direction: column;
  }

  /* ── Header Area ── */
  .config-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 32px;
  }

  .icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(30, 58, 138, 0.4);
    border: 1px solid rgba(59, 130, 246, 0.2);
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }
  
  .brand-name {
    font-family: 'Orbitron', sans-serif;
    font-weight: 800;
    font-size: 2.2rem;
    letter-spacing: 0.1em;
    background: linear-gradient(90deg, #60a5fa, #7dd3fc, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 8px 0;
  }

  .subtitle {
    color: #94a3b8;
    font-size: 0.95rem;
    margin: 0;
  }

  /* ── Form Elements ── */
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 28px;
  }

  .form-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    color: #cbd5e1;
    margin-bottom: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .form-input {
    width: 100%;
    padding: 16px 20px;
    background: rgba(2, 6, 23, 0.5);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-radius: 12px;
    color: #e2e8f0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .form-hint {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 10px;
    line-height: 1.5;
  }
  .form-hint span {
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── Buttons ── */
  .btn-primary {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px;
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    cursor: pointer;
    transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  }
  .btn-primary.success {
    background: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  .btn-primary:not(.success):hover {
    background: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  }
  
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 24px;
    transition: color 0.3s;
    align-self: flex-start;
  }
  .back-link:hover {
    color: #e2e8f0;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #020617; }
  ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 4px; border: 1px solid #020617; }
  ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
  
  /* ── Entry animations ── */
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.6s forwards cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function ConfigPage() {
  const router = useRouter();
  const [wsUrl, setWsUrl]   = useState("ws://localhost:8765");
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("sweenex_ws_url");
    if (s) setWsUrl(s);
  }, []);

  const save = () => {
    localStorage.setItem("sweenex_ws_url", wsUrl);
    setSaved(true);
    setTimeout(() => { 
      setSaved(false); 
      router.push("/dashboard"); 
    }, 1000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="config-root">
        {/* Background blobs */}
        <div className="blob blob-1" aria-hidden />
        <div className="blob blob-2" aria-hidden />
        <div className="blob blob-3" aria-hidden />

        <main className="config-main fade-up">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="config-panel">
            <div className="config-header">
              <div className="icon-wrap">
                <Server size={32} />
              </div>
              <h1 className="brand-name">Config</h1>
              <p className="subtitle">Configure connection to the Python server</p>
            </div>

            <div className="form-group">
              <label className="form-label">WebSocket URL</label>
              <input
                className="form-input"
                value={wsUrl}
                onChange={e => setWsUrl(e.target.value)}
                placeholder="ws://localhost:8765"
              />
              <p className="form-hint">
                Development: <span>ws://localhost:8765</span><br/>
                Production (LAN): <span>ws://192.168.1.XXX:8765</span><br/>
                Internet: <span>ws://0.tcp.ngrok.io:PORT</span>
              </p>
            </div>

            <button
              onClick={save}
              className={"btn-primary " + (saved ? "success" : "")}
              disabled={saved}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={20} />
                  Saved! Redirecting...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save & Go to Dashboard
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
