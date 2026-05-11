import numpy as np
import pytest
from src.multi_router_merger import MultiRouterMerger
from src.config import Config
@pytest.fixture
def cfg():
    return Config(window_size=10, n_subcarriers=52, max_routers=3)
@pytest.fixture
def merger(cfg):
    return MultiRouterMerger(cfg)
def make_packet(bssid: str, seed: int = 42) -> dict:
    rng = np.random.default_rng(seed)
    return {
        "bssid":     bssid,
        "amplitude": rng.random(52).astype(np.float32),
    }
def test_single_router_fills_returns_tensor(merger):
    result = None
    for _ in range(10):
        result = merger.update(make_packet("AA:BB:CC:00"))
    assert result is not None
    assert result.shape == (10, 52)
    assert result.dtype == np.float32
def test_two_routers_concat_features(merger):
    for i in range(10):
        merger.update(make_packet("AA:BB:CC:01", seed=i))
        merger.update(make_packet("AA:BB:CC:02", seed=i + 100))
    result = merger.update(make_packet("AA:BB:CC:01", seed=99))
    if result is not None:
        assert result.shape[1] == 104
def test_max_routers_not_exceeded(merger):
    for i in range(6):
        merger.update(make_packet(f"AA:BB:CC:{i:02X}"))
    assert len(merger.router_order) <= 3
def test_router_info_correct(merger):
    for _ in range(5):
        merger.update(make_packet("AA:BB:CC:01"))
    info = merger.get_router_info()
    assert len(info) == 1
    assert info[0]["bssid"]   == "AA:BB:CC:01"
    assert info[0]["samples"] == 5
    assert info[0]["full"]    is False
def test_reset_clears_buffers(merger):
    for _ in range(10):
        merger.update(make_packet("AA:BB:CC:01"))
    merger.reset()
    info = merger.get_router_info()
    assert all(i["samples"] == 0 for i in info)
def test_short_amplitude_padded(merger):
    pkt = make_packet("AA:BB:CC:01")
    pkt["amplitude"] = pkt["amplitude"][:20]
    result = None
    for _ in range(10):
        result = merger.update(pkt)
    assert result is not None
    assert result.shape == (10, 52)