import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from pathlib import Path
from model_architecture import sweenexPoseModel
from dataset_loader import sweenexDataset
def mpjpe(pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
    return ((pred - target) ** 2).sum(dim=-1).sqrt().mean() * 1000
def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    dataset = sweenexDataset(data_dir=args.data, window_size=100, n_routers=args.n_routers)
    n_val   = int(len(dataset) * 0.15)
    n_train = len(dataset) - n_val
    train_ds, val_ds = random_split(dataset, [n_train, n_val])
    train_dl = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True,  num_workers=4)
    val_dl   = DataLoader(val_ds,   batch_size=args.batch_size, shuffle=False, num_workers=4)
    F     = args.n_routers * 52
    model = sweenexPoseModel(T=100, F=F, n_kp=17).to(device)
    print(f"Model params: {sum(p.numel() for p in model.parameters()):,}")
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    kp_loss_fn   = nn.SmoothL1Loss()
    conf_loss_fn = nn.BCELoss()
    best_val_mpjpe = float("inf")
    output_dir     = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    for epoch in range(1, args.epochs + 1):
        model.train()
        train_loss = 0.0
        for csi, kp_gt, conf_gt in train_dl:
            csi, kp_gt, conf_gt = csi.to(device), kp_gt.to(device), conf_gt.to(device)
            kp_pred, conf_pred = model(csi)
            loss = kp_loss_fn(kp_pred, kp_gt) + 0.1 * conf_loss_fn(conf_pred, conf_gt)
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            train_loss += loss.item()
        scheduler.step()
        model.eval()
        val_mpjpe = 0.0
        with torch.no_grad():
            for csi, kp_gt, conf_gt in val_dl:
                csi, kp_gt = csi.to(device), kp_gt.to(device)
                kp_pred, _ = model(csi)
                val_mpjpe += mpjpe(kp_pred, kp_gt).item()
        val_mpjpe /= len(val_dl)
        print(f"Epoch {epoch:3d}/{args.epochs} | "
              f"Loss: {train_loss/len(train_dl):.4f} | "
              f"Val MPJPE: {val_mpjpe:.1f}mm")
        if val_mpjpe < best_val_mpjpe:
            best_val_mpjpe = val_mpjpe
            torch.save(model.state_dict(), output_dir / "best.pt")
            print(f"  ✓ Best model saved (MPJPE={val_mpjpe:.1f}mm)")
    print(f"\nTraining complete. Best MPJPE: {best_val_mpjpe:.1f}mm")
if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--data",       required=True)
    p.add_argument("--output",     default="checkpoints/")
    p.add_argument("--epochs",     type=int, default=100)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--lr",         type=float, default=1e-3)
    p.add_argument("--n-routers",  type=int, default=3)
    train(p.parse_args())