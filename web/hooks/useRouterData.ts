"use client";
import { useState, useEffect } from "react";
import { RouterInfo, sweenexFrame } from "@/types/skeleton";
export function useRouterData(lastMessage: unknown): {
  routers:    RouterInfo[];
  activeCount: number;
} {
  const [routers, setRouters] = useState<RouterInfo[]>([]);
  useEffect(() => {
    if (!lastMessage) return;
    const msg = lastMessage as sweenexFrame;
    if (msg.type !== "frame") return;
    if (msg.routers) setRouters(msg.routers);
  }, [lastMessage]);
  return {
    routers,
    activeCount: routers.filter(r => r.full).length,
  };
}
