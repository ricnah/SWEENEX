import numpy as np
import torch
from torch.utils.data import Dataset
from pathlib import Path
from typing import Tuple
class sweenexDataset(Dataset):
    def __init__(self, data_dir: str, window_size: int = 100, n_routers: int = 3):
        self.window_size = window_size
        self.n_routers   = n_routers
        self.samples     = []
        data_path = Path(data_dir)
        for subject_dir in sorted(data_path.iterdir()):
            if not subject_dir.is_dir():
                continue
            csi_dir  = subject_dir / "csi"
            pose_dir = subject_dir / "pose"
            if not (csi_dir.exists() and pose_dir.exists()):
                continue
            for csi_file in sorted(csi_dir.glob("*.npy")):
                pose_file = pose_dir / csi_file.name
                if pose_file.exists():
                    self.samples.append((csi_file, pose_file))
        print(f"Dataset: {len(self.samples)} samples from {data_dir}")
    def __len__(self) -> int:
        return len(self.samples)
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        csi_path, pose_path = self.samples[idx]
        csi = np.load(csi_path).astype(np.float32)
        T, N, S = csi.shape
        csi = csi.reshape(T, N * S)[:self.window_size]
        if len(csi) < self.window_size:
            csi = np.pad(csi, ((0, self.window_size - len(csi)), (0, 0)))
        mn, mx = csi.min(), csi.max()
        if mx - mn > 1e-8:
            csi = (csi - mn) / (mx - mn)
        csi_tensor = torch.from_numpy(csi).unsqueeze(0)
        pose = np.load(pose_path).astype(np.float32)
        kp   = torch.from_numpy(pose[:17])
        conf = torch.ones(17, dtype=torch.float32)
        return csi_tensor, kp, conf