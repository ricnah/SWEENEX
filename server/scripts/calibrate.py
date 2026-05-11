import argparse
import numpy as np
import serial
import json
import time
import os
def calibrate(port: str, baudrate: int, duration: int):
    print(f'Calibrating for {duration}s...')
    print('PASTIKAN TIDAK ADA ORANG DI RUANGAN!\n')
    time.sleep(3)
    ser = serial.Serial(port, baudrate, timeout=1)
    samples = []
    t_end = time.time() + duration
    while time.time() < t_end:
        remaining = t_end - time.time()
        line = ser.readline()
        if not line:
            continue
        try:
            pkt = json.loads(line.decode().strip())
            buf = np.array(pkt['buf'], dtype=np.int8)
            amp = np.abs(buf[0::2].astype(np.float32) + 1j * buf[1::2].astype(np.float32))
            samples.append(amp)
            if len(samples) % 50 == 0:
                print(f'  Collecting... {len(samples)} samples | {remaining:.0f}s left', end='\r')
        except Exception:
            continue
    ser.close()
    if not samples:
        print('\nERROR: Tidak ada data CSI diterima!')
        return
    baseline = np.stack(samples).mean(axis=0)
    os.makedirs('configs', exist_ok=True)
    np.save('configs/room_baseline.npy', baseline)
    print(f'\n\n✓ Kalibrasi selesai!')
    print(f'  Samples:     {len(samples)}')
    print(f'  Noise floor: {baseline.mean():.4f} ± {baseline.std():.4f}')
    print(f'  Saved:       configs/room_baseline.npy')
    print(f'\nKalibrasi ulang setiap kali posisi ESP32 atau router berubah!')
if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--port', default='/dev/ttyUSB0')
    p.add_argument('--duration', type=int, default=30)
    args = p.parse_args()
    calibrate(args.port, 921600, args.duration)