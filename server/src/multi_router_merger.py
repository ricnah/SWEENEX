import numpy as np
from collections import defaultdict, deque
from typing import Dict, List, Optional
from .config import Config
from .logger import get_logger
logger = get_logger(__name__)
class MultiRouterMerger:
    def __init__(self, config: Config):
        self.window_size = config.window_size
        self.n_subcarriers = config.n_subcarriers
        self.max_routers = config.max_routers
        self.buffers: Dict[str, deque] = defaultdict(lambda: deque(maxlen=self.window_size))
        self.router_order: List[str] = []
    def update(self, packet: dict) -> Optional[np.ndarray]:
        bssid = packet['bssid']
        amp = packet['amplitude']
        if bssid not in self.router_order:
            if len(self.router_order) < self.max_routers:
                self.router_order.append(bssid)
                logger.info('Router detected', bssid=bssid, total=len(self.router_order))
            else:
                return None
        if len(amp) < self.n_subcarriers:
            amp = np.pad(amp, (0, self.n_subcarriers - len(amp)))
        else:
            amp = amp[:self.n_subcarriers]
        self.buffers[bssid].append(amp.astype(np.float32))
        if len(self.router_order) == 0:
            return None
        all_full = all((len(self.buffers[b]) >= self.window_size for b in self.router_order))
        if not all_full:
            return None
        return self._merge()
    def _merge(self) -> np.ndarray:
        tensors = []
        for bssid in self.router_order:
            buf = np.stack(list(self.buffers[bssid]))
            tensors.append(buf)
        return np.concatenate(tensors, axis=1).astype(np.float32)
    def get_router_info(self) -> List[dict]:
        return [{'bssid': b, 'samples': len(self.buffers[b]), 'full': len(self.buffers[b]) >= self.window_size} for b in self.router_order]
    def reset(self) -> None:
        for b in self.router_order:
            self.buffers[b].clear()
        logger.info('MultiRouterMerger reset')