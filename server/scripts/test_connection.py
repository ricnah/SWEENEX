import argparse
import serial
import json
import time
from collections import defaultdict
def test_connection(port: str, baudrate: int=921600, duration: int=10):
    print(f'Testing ESP32 connection on {port} for {duration}s...\n')
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
    except serial.SerialException as e:
        print(f'ERROR: Tidak bisa buka port {port}: {e}')
        print('Pastikan:')
        print('  1. ESP32 sudah di-flash dengan firmware sweenex')
        print('  2. Kabel USB data (bukan charge-only)')
        print('  3. Driver CH340 sudah terinstall')
        return
    packets = 0
    errors = 0
    routers_seen = defaultdict(int)
    t_start = time.time()
    t_end = t_start + duration
    while time.time() < t_end:
        line = ser.readline()
        if not line:
            continue
        try:
            pkt = json.loads(line.decode('utf-8').strip())
            packets += 1
            routers_seen[pkt.get('bssid', '?')] += 1
        except Exception:
            errors += 1
        elapsed = time.time() - t_start
        if int(elapsed) > 0 and packets % 100 == 0:
            fps = packets / elapsed
            print(f'  {elapsed:.0f}s — {packets} packets — {fps:.1f} Hz — {len(routers_seen)} routers', end='\r')
    ser.close()
    elapsed = time.time() - t_start
    fps = packets / elapsed if elapsed > 0 else 0
    print(f"\n\n{'=' * 50}")
    print(f'Hasil Test ({duration}s):')
    print(f'  Total packets : {packets}')
    print(f"  Sampling rate : {fps:.1f} Hz  {('✓' if fps >= 80 else '✗ (target: >= 80 Hz)')}")
    print(f'  Parse errors  : {errors}')
    print(f'  Routers seen  : {len(routers_seen)}')
    print(f'\nRouter details:')
    for bssid, count in sorted(routers_seen.items(), key=lambda x: -x[1]):
        print(f'  {bssid}  →  {count} packets ({count / packets * 100:.1f}%)')
    if fps >= 80 and len(routers_seen) >= 1:
        print('\n✓ Koneksi OK! Server siap dijalankan.')
    else:
        print('\n✗ Ada masalah. Cek firmware ESP32 dan channel_hopper.c')
if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--port', default='/dev/ttyUSB0')
    p.add_argument('--duration', type=int, default=10)
    args = p.parse_args()
    test_connection(args.port, duration=args.duration)