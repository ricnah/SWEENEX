export interface SkeletonViewerProps {
  keypoints:   number[][];
  confidences: number[];
  connections: [number, number][];
  width?:      number;
  height?:     number;
}
