import numpy as np
import onnxruntime as ort
from pathlib import Path
from .config import Config
from .logger import get_logger
logger = get_logger(__name__)
KEYPOINT_NAMES = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle']
SKELETON_CONNECTIONS = [(0, 1), (0, 2), (1, 3), (2, 4), (5, 6), (5, 7), (7, 9), (6, 8), (8, 10), (5, 11), (6, 12), (11, 12), (11, 13), (13, 15), (12, 14), (14, 16)]
N_KEYPOINTS = len(KEYPOINT_NAMES)
class PoseEstimator:
    def __init__(self, config: Config):
        model_path = Path(config.model_path)
        if not model_path.exists():
            raise FileNotFoundError(f'Model tidak ditemukan: {model_path}\nJalankan: python scripts/download_models.py')
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 4
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
        self.session = ort.InferenceSession(str(model_path), sess_options=opts, providers=providers)
        self.input_name = self.session.get_inputs()[0].name
        inp_shape = self.session.get_inputs()[0].shape
        self.expected_F = inp_shape[-1] if isinstance(inp_shape[-1], int) and inp_shape[-1] > 0 else None
        self.min_conf = config.min_confidence
        logger.info('Model loaded', path=model_path.name, provider=self.session.get_providers()[0], input_shape=inp_shape)
    def predict(self, tensor: np.ndarray) -> Optional[dict]:
        T, F = tensor.shape
        if self.expected_F is not None:
            if F < self.expected_F:
                tensor = np.pad(tensor, ((0, 0), (0, self.expected_F - F)))
            elif F > self.expected_F:
                tensor = tensor[:, :self.expected_F]
        inp = tensor[np.newaxis, np.newaxis, :, :].astype(np.float32)
        outputs = self.session.run(None, {self.input_name: inp})
        keypoints = outputs[0][0]
        confidences = outputs[1][0]
        mean_conf = float(confidences.mean())
        if mean_conf < self.min_conf:
            return None
        return {'keypoints': keypoints.tolist(), 'confidences': confidences.tolist(), 'keypoint_names': KEYPOINT_NAMES, 'connections': SKELETON_CONNECTIONS, 'mean_confidence': round(mean_conf, 4)}
from typing import Optional