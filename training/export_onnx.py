import argparse
import torch
from pathlib import Path
from model_architecture import sweenexPoseModel
def export(args):
    device = torch.device("cpu")
    F      = args.n_routers * 52
    model  = sweenexPoseModel(T=100, F=F, n_kp=17)
    ckpt   = torch.load(args.checkpoint, map_location=device)
    model.load_state_dict(ckpt)
    model.eval()
    dummy = torch.randn(1, 1, 100, F)
    torch.onnx.export(
        model, dummy, args.output,
        input_names  = ["csi_tensor"],
        output_names = ["keypoints_3d", "confidences"],
        dynamic_axes = {
            "csi_tensor":   {0: "batch", 3: "features"},
            "keypoints_3d": {0: "batch"},
            "confidences":  {0: "batch"},
        },
        opset_version   = 17,
        do_constant_folding = True,
    )
    print(f"Model exported: {args.output}")
    print(f"File size: {Path(args.output).stat().st_size / 1e6:.1f} MB")
    if args.simplify:
        try:
            import onnx
            from onnxsim import simplify
            model_onnx = onnx.load(args.output)
            model_sim, ok = simplify(model_onnx)
            if ok:
                onnx.save(model_sim, args.output)
                print("Model simplified successfully")
        except ImportError:
            print("onnx-simplifier not installed, skipping simplification")
if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--checkpoint", required=True)
    p.add_argument("--output",     default="sweenex_pose.onnx")
    p.add_argument("--n-routers",  type=int, default=3)
    p.add_argument("--simplify",   action="store_true")
    export(p.parse_args())