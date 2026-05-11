import numpy as np
from typing import Optional
def assemble_skeleton(pose_result: Optional[dict]) -> Optional[dict]:
    if pose_result is None:
        return None
    keypoints = pose_result['keypoints']
    confidences = pose_result['confidences']
    connections = pose_result['connections']
    pts = np.array(keypoints)
    bbox = {'min': pts.min(axis=0).tolist(), 'max': pts.max(axis=0).tolist(), 'center': pts.mean(axis=0).tolist()}
    nose_y = keypoints[0][1]
    ankle_y = (keypoints[15][1] + keypoints[16][1]) / 2
    est_height = abs(nose_y - ankle_y)
    return {'keypoints': keypoints, 'confidences': confidences, 'connections': connections, 'keypoint_names': pose_result['keypoint_names'], 'mean_confidence': pose_result['mean_confidence'], 'bbox': bbox, 'estimated_height_m': round(est_height, 3)}