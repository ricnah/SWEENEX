"use client";
import { useEffect, useRef, useCallback, useState } from "react";
export type WsStatus = "connecting" | "connected" | "disconnected" | "error";
export interface UseWebSocketReturn {
  status:      WsStatus;
  lastMessage: unknown;
  latency:     number;
  send:        (data: object) => void;
  reconnect:   () => void;
}
export function useWebSocket(url: string): UseWebSocketReturn {
  const wsRef           = useRef<WebSocket | null>(null);
  const [status,       setStatus]      = useState<WsStatus>("disconnected");
  const [lastMessage,  setLastMessage] = useState<unknown>(null);
  const [latency,      setLatency]     = useState<number>(0);
  const pingTs          = useRef<number>(0);
  const pingInterval    = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef      = useRef(true);
  const clearTimers = () => {
    if (pingInterval.current)   clearInterval(pingInterval.current);
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
  };
  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    clearTimers();
    setStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      setStatus("error");
      return;
    }
    ws.onopen = () => {
      if (!mountedRef.current) return;
      setStatus("connected");
      // Start ping-pong latency measurement
      pingInterval.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        pingTs.current = Date.now();
        ws.send(JSON.stringify({ type: "ping" }));
      }, 5000);
    };
    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "pong") {
          setLatency(Date.now() - pingTs.current);
          return;
        }
        setLastMessage(msg);
      } catch { /* ignore malformed */ }
    };
    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("error");
    };
    ws.onclose = () => {
      if (!mountedRef.current) return;
      clearTimers();
      setStatus("disconnected");
      // Auto-reconnect setelah 3 detik
      reconnectTimer.current = setTimeout(connect, 3000);
    };
    wsRef.current = ws;
  }, [url]);
  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimers();
      wsRef.current?.close();
    };
  }, [connect]);
  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);
  return { status, lastMessage, latency, send, reconnect: connect };
}
