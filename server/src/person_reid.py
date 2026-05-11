import numpy as np
from typing import Dict, List, Optional, Tuple
from .logger import get_logger
logger = get_logger(__name__)
class PersonReID:
    def __init__(self, threshold: float=0.85):
        self.threshold = threshold
        self.gallery: Dict[str, np.ndarray] = {}
        self._encoder = self._build_encoder()
    def _build_encoder(self):
        def encode(csi_window: np.ndarray) -> np.ndarray:
            mean = csi_window.mean(axis=0)
            std = csi_window.std(axis=0)
            fft = np.abs(np.fft.fft(csi_window, axis=0))[:50, :]
            fft_f = fft.mean(axis=1)
            raw = np.concatenate([mean[:39], std[:39], fft_f[:50]])
            norm = np.linalg.norm(raw)
            return raw / norm if norm > 1e-08 else raw
        return encode
    def enroll(self, person_id: str, csi_windows: List[np.ndarray]) -> None:
        embeddings = [self._encoder(w) for w in csi_windows]
        self.gallery[person_id] = np.stack(embeddings).mean(axis=0)
        logger.info('Person enrolled', person_id=person_id, n_windows=len(csi_windows))
    def identify(self, csi_window: np.ndarray) -> Tuple[Optional[str], float]:
        if not self.gallery:
            return (None, 0.0)
        embedding = self._encoder(csi_window)
        best_id, best_sim = (None, -1.0)
        for pid, gallery_emb in self.gallery.items():
            sim = float(np.dot(embedding, gallery_emb))
            if sim > best_sim:
                best_sim = sim
                best_id = pid
        if best_sim >= self.threshold:
            return (best_id, best_sim)
        return (None, best_sim)
    def list_persons(self) -> List[str]:
        return list(self.gallery.keys())