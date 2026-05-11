import numpy as np
from sklearn.decomposition import PCA
from .config import Config
from .logger import get_logger
logger = get_logger(__name__)
class CSIPreprocessor:
    def __init__(self, config: Config):
        self.pca_components = config.pca_components
        self.pca = PCA(n_components=self.pca_components)
        self.is_fitted = False
    def process(self, tensor: np.ndarray) -> np.ndarray:
        tensor = self._hampel_filter(tensor)
        if not self.is_fitted:
            self.pca.fit(tensor)
            self.is_fitted = True
            logger.info('PCA fitted', n_components=self.pca_components, explained_var=float(self.pca.explained_variance_ratio_.sum()))
        projected = self.pca.transform(tensor)
        projected[:, :3] = 0.0
        tensor = self.pca.inverse_transform(projected)
        mn, mx = (tensor.min(), tensor.max())
        if mx - mn > 1e-08:
            tensor = (tensor - mn) / (mx - mn)
        else:
            tensor = np.zeros_like(tensor)
        return tensor.astype(np.float32)
    def _hampel_filter(self, data: np.ndarray, k: int=5, sigma: float=3.0) -> np.ndarray:
        out = data.copy()
        T, F = data.shape
        for col in range(F):
            s = data[:, col]
            for i in range(k, T - k):
                seg = s[i - k:i + k + 1]
                med = float(np.median(seg))
                mad = float(np.median(np.abs(seg - med)))
                if mad > 1e-10 and abs(s[i] - med) > sigma * 1.4826 * mad:
                    out[i, col] = med
        return out
    def reset(self) -> None:
        self.is_fitted = False
        logger.info('Preprocessor PCA reset')