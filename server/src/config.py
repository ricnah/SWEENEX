from dataclasses import dataclass, field
from typing import List
@dataclass
class Config:
    esp32_port: str = "/dev/ttyUSB0"
    baudrate:   int = 921600
    known_router_bssids: List[str] = field(default_factory=list)
    max_routers:         int = 8
    window_size:    int = 100
    n_subcarriers:  int = 52
    pca_components: int = 15
    motion_threshold: float = 0.12
    model_path:     str   = "models/sweenex_pose.onnx"
    min_confidence: float = 0.30
    ws_host: str = "0.0.0.0"
    ws_port: int = 8765
    log_level: str = "INFO"
    log_file:  str = "logs/sweenex.log"