export interface Keypoint3D {
  x: number;
  y: number;
  z: number;
}
export interface SkeletonPose {
  keypoints:       number[][];          // [[x,y,z], ...] × 17
  confidences:     number[];            // [float] × 17
  keypoint_names:  string[];
  connections:     [number, number][];
  mean_confidence: number;
  bbox?: {
    min:    number[];
    max:    number[];
    center: number[];
  };
  estimated_height_m?: number;
}
export interface RouterInfo {
  bssid:   string;
  samples: number;
  full:    boolean;
}
export interface sweenexFrame {
  type:         "frame";
  frame_id:     number;
  timestamp:    number;
  motion:       boolean;
  motion_score: number;
  rssi:         number;
  bssid:        string;
  routers:      RouterInfo[];
  pose:         SkeletonPose | null;
}
export interface sweenexStatus {
  type:        "status";
  fps:         number;
  frame_count: number;
  clients:     number;
  routers:     RouterInfo[];
  uptime:      number;
}
export const KEYPOINT_NAMES = [
  "nose", "left_eye", "right_eye", "left_ear", "right_ear",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle",
] as const;
export const SKELETON_CONNECTIONS: [number, number][] = [
  [0,1],[0,2],[1,3],[2,4],
  [5,6],[5,7],[7,9],[6,8],[8,10],
  [5,11],[6,12],[11,12],
  [11,13],[13,15],[12,14],[14,16],
];
