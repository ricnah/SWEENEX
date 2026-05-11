import numpy as np
import pytest
from src.preprocessor import CSIPreprocessor
from src.config import Config
@pytest.fixture
def cfg():
    return Config(window_size=100, n_subcarriers=52, pca_components=10)
@pytest.fixture
def pp(cfg):
    return CSIPreprocessor(cfg)
def test_output_shape_and_dtype(pp):
    inp = np.random.rand(100, 52).astype(np.float32)
    out = pp.process(inp)
    assert out.shape == (100, 52)
    assert out.dtype == np.float32
def test_output_normalized_0_to_1(pp):
    inp = np.random.rand(100, 52).astype(np.float32) * 1000
    out = pp.process(inp)
    assert float(out.min()) >= -1e-5
    assert float(out.max()) <= 1.0 + 1e-5
def test_hampel_suppresses_spike(pp):
    inp = np.random.normal(0.5, 0.01, size=(100, 52)).astype(np.float32)
    inp[50, 0] = 9999.0
    out = pp._hampel_filter(inp)
    assert out[50, 0] < 1.0
def test_reset_clears_pca_fit(pp):
    inp = np.random.rand(100, 52).astype(np.float32)
    pp.process(inp)
    assert pp.is_fitted
    pp.reset()
    assert not pp.is_fitted
def test_all_zeros_input_handled(pp):
    inp = np.zeros((100, 52), dtype=np.float32)
    out = pp.process(inp)
    assert not np.isnan(out).any()
    assert not np.isinf(out).any()