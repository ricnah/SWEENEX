import urllib.request
import os
import hashlib
from pathlib import Path
MODELS = {'sweenex_pose.onnx': {'url': 'https://github.com/YOUR_USERNAME/sweenex-models/releases/download/v2.0/sweenex_pose.onnx', 'size': '~30MB', 'sha256': None}, 'motion_classifier.onnx': {'url': 'https://github.com/YOUR_USERNAME/sweenex-models/releases/download/v2.0/motion_classifier.onnx', 'size': '~2MB', 'sha256': None}}
def download(url: str, dest: Path, label: str):
    print(f'Downloading {label}...')
    dest.parent.mkdir(parents=True, exist_ok=True)
    def progress(block, block_size, total):
        done = block * block_size
        pct = done / total * 100 if total > 0 else 0
        print(f'  {pct:.1f}% ({done / 1000000.0:.1f}MB)', end='\r')
    try:
        urllib.request.urlretrieve(url, dest, reporthook=progress)
        print(f'\n  ✓ Saved: {dest}')
    except Exception as e:
        print(f'\n  ✗ Failed: {e}')
        print(f'  Manual download: {url}')
        print(f'  Place at: {dest}')
if __name__ == '__main__':
    print('=== sweenex Model Downloader ===\n')
    for filename, info in MODELS.items():
        dest = Path('models') / filename
        if dest.exists():
            print(f'  ✓ {filename} sudah ada, skip.')
            continue
        download(info['url'], dest, f"{filename} ({info['size']})")
    print('\nDone. Run: python main.py --port /dev/ttyUSB0')