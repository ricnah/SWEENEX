"use client";
import { useMemo } from "react";
import { SkeletonViewerProps } from "./types";
const GRID_W = 60;
const GRID_H = 30;
export function AsciiSkeleton({ keypoints, confidences }: SkeletonViewerProps) {
  const ascii = useMemo(() => {
    if (!keypoints.length) {
      return Array(GRID_H).fill(" ".repeat(GRID_W)).join("\n");
    }
    const grid: string[][] = Array.from({ length: GRID_H }, () =>
      Array(GRID_W).fill(" ")
    );
    // Normalisasi keypoints ke grid
    const xs = keypoints.map(k => k[0]);
    const ys = keypoints.map(k => k[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const toGrid = (kp: number[]) => ({
      col: Math.floor(((kp[0] - minX) / rangeX) * (GRID_W - 2)) + 1,
      row: Math.floor(((1 - (kp[1] - minY) / rangeY)) * (GRID_H - 2)) + 1,
    });
    // Draw joints
    keypoints.forEach((kp, i) => {
      const conf = confidences[i] ?? 0;
      if (conf < 0.3) return;
      const { col, row } = toGrid(kp);
      if (row >= 0 && row < GRID_H && col >= 0 && col < GRID_W) {
        grid[row][col] = i === 0 ? "O" : "o";
      }
    });
    return grid.map(row => row.join("")).join("\n");
  }, [keypoints, confidences]);
  return (
    <pre
      style={{
        fontFamily:  "monospace",
        fontSize:    "12px",
        lineHeight:  "1.2",
        color:       "#00d4ff",
        background:  "#0f172a",
        padding:     "8px",
        borderRadius: "4px",
        whiteSpace:  "pre",
        overflow:    "hidden",
      }}
    >
      {ascii}
    </pre>
  );
}
