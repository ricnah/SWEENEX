"use client";
import { useState, useEffect, useRef } from "react";
import { sweenexFrame, SkeletonPose, RouterInfo } from "@/types/skeleton";
export interface SkeletonDataState {
  pose:         SkeletonPose | null;
  motion:       boolean;
  motionScore:  number;
  frameId:      number;
  fps:          number;
  routers:      RouterInfo[];
  rssi:         number;
}
export function useSkeletonData(lastMessage: unknown): SkeletonDataState {
  const [state, setState] = useState<SkeletonDataState>({
    pose:        null,
    motion:      false,
    motionScore: 0,
    frameId:     0,
    fps:         0,
    routers:     [],
    rssi:        -99,
  });
  const frameTimestamps = useRef<number[]>([]);
  useEffect(() => {
    if (!lastMessage) return;
    const msg = lastMessage as sweenexFrame;
    if (msg.type !== "frame") return;
    // Hitung FPS dari sliding window timestamps
    const now = Date.now();
    frameTimestamps.current.push(now);
    // Simpan hanya 2 detik terakhir
    frameTimestamps.current = frameTimestamps.current.filter(t => now - t < 2000);
    const fps = frameTimestamps.current.length / 2;
    setState({
      pose:        msg.pose,
      motion:      msg.motion,
      motionScore: msg.motion_score,
      frameId:     msg.frame_id,
      fps:         Math.round(fps * 10) / 10,
      routers:     msg.routers || [],
      rssi:        msg.rssi,
    });
  }, [lastMessage]);
  return state;
}
