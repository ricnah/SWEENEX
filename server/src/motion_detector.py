import numpy as np
from collections import deque
from .config import Config
from .logger import get_logger
logger = get_logger(__name__)
class MotionDetector:
    def __init__(self, config: Config):
        self.base_threshold = config.motion_threshold
        self._history: deque = deque(maxlen=60)
    def detect(self, tensor: np.ndarray) -> tuple[bool, float]:
        var = np.var(tensor, axis=0)
        score = float(np.mean(var))
        self._history.append(score)
        if len(self._history) >= 20:
            history_arr = np.array(self._history)
            baseline = float(np.percentile(history_arr[:20], 75))
            threshold = max(self.base_threshold, baseline * 1.8)
        else:
            threshold = self.base_threshold
        motion = score > threshold
        return (motion, score)
    @property
    def history_stats(self) -> dict:
        if len(self._history) == 0:
            return {}
        arr = np.array(self._history)
        return {'mean': float(arr.mean()), 'std': float(arr.std()), 'min': float(arr.min()), 'max': float(arr.max())}