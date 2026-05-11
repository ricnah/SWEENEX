import numpy as np
import pytest
from src.motion_detector import MotionDetector
from src.config import Config
@pytest.fixture
def detector():
    return MotionDetector(Config(motion_threshold=0.10))
def test_static_returns_false(detector):
    tensor = np.ones((100, 52), dtype=np.float32) * 0.5
    motion, score = detector.detect(tensor)
    assert motion is False
    assert score >= 0.0
def test_random_noise_motion(detector):
    tensor = np.random.rand(100, 52).astype(np.float32)
    motion, score = detector.detect(tensor)
    assert isinstance(motion, bool)
    assert score > 0.0
def test_score_nonnegative(detector):
    for _ in range(10):
        tensor = np.random.rand(100, 52).astype(np.float32)
        _, score = detector.detect(tensor)
        assert score >= 0.0
def test_history_stats_populated(detector):
    for _ in range(25):
        detector.detect(np.random.rand(100, 52).astype(np.float32))
    stats = detector.history_stats
    assert "mean" in stats
    assert "std"  in stats