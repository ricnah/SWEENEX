import torch
import torch.nn as nn
from typing import Tuple
class sweenexPoseModel(nn.Module):
    def __init__(self, T: int = 100, F: int = 156, n_kp: int = 17):
        super().__init__()
        self.n_kp = n_kp
        self.spatial = nn.Sequential(
            nn.Conv2d(1, 32, (3, 3), padding=1),
            nn.BatchNorm2d(32), nn.GELU(),
            nn.Conv2d(32, 64, (3, 3), padding=1),
            nn.BatchNorm2d(64), nn.GELU(),
            nn.MaxPool2d((1, 2)),
            nn.Conv2d(64, 128, (3, 3), padding=1),
            nn.BatchNorm2d(128), nn.GELU(),
            nn.AdaptiveAvgPool2d((T, 1)),
        )
        enc_layer = nn.TransformerEncoderLayer(
            d_model=128, nhead=8, dim_feedforward=512,
            dropout=0.1, batch_first=True, norm_first=True,
        )
        self.transformer = nn.TransformerEncoder(enc_layer, num_layers=4)
        self.gap = nn.AdaptiveAvgPool1d(1)
        self.kp_head = nn.Sequential(
            nn.Linear(128, 256), nn.GELU(), nn.Dropout(0.1),
            nn.Linear(256, n_kp * 3),
        )
        self.conf_head = nn.Sequential(
            nn.Linear(128, n_kp), nn.Sigmoid(),
        )
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        f  = self.spatial(x).squeeze(-1)
        f  = self.transformer(f.permute(0, 2, 1))
        f  = self.gap(f.permute(0, 2, 1)).squeeze(-1)
        kp = self.kp_head(f).view(-1, self.n_kp, 3)
        cf = self.conf_head(f)
        return kp, cf