import subprocess
import re
import sys
def scan_linux() -> list:
    try:
        result = subprocess.run(['sudo', 'iwlist', 'scan'], capture_output=True, text=True, timeout=10)
        raw = result.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print('ERROR: iwlist tidak tersedia. Install: sudo apt install wireless-tools')
        return []
    routers = []
    for cell in raw.split('Cell ')[1:]:
        bssid = re.search('Address: ([\\dA-Fa-f:]+)', cell)
        ssid = re.search('ESSID:"([^"]*)"', cell)
        ch = re.search('Channel:(\\d+)', cell)
        rssi = re.search('Signal level=(-\\d+)', cell)
        freq = re.search('Frequency:([\\d.]+)', cell)
        if not bssid:
            continue
        freq_val = float(freq.group(1)) if freq else 2.4
        band = '5GHz' if freq_val > 4.0 else '2.4GHz'
        routers.append({'bssid': bssid.group(1).upper(), 'ssid': ssid.group(1) if ssid else '?', 'channel': int(ch.group(1)) if ch else 0, 'rssi': int(rssi.group(1)) if rssi else -99, 'band': band})
    return sorted(routers, key=lambda x: x['rssi'], reverse=True)
def scan_windows() -> list:
    try:
        result = subprocess.run(['netsh', 'wlan', 'show', 'networks', 'mode=bssid'], capture_output=True, text=True, timeout=10)
        routers = []
        blocks = result.stdout.split('SSID')
        for block in blocks[1:]:
            ssid = re.search(':\\s*(.+)', block.split('\n')[0])
            bssid = re.search('BSSID \\d+\\s*:\\s*([\\dA-Fa-f:]+)', block)
            rssi = re.search('Signal\\s*:\\s*(\\d+)%', block)
            ch = re.search('Channel\\s*:\\s*(\\d+)', block)
            if bssid:
                rssi_pct = int(rssi.group(1)) if rssi else 50
                rssi_dbm = rssi_pct // 2 - 100
                routers.append({'bssid': bssid.group(1).upper(), 'ssid': ssid.group(1).strip() if ssid else '?', 'channel': int(ch.group(1)) if ch else 0, 'rssi': rssi_dbm, 'band': '?'})
        return sorted(routers, key=lambda x: x['rssi'], reverse=True)
    except Exception as e:
        print(f'ERROR: {e}')
        return []
if __name__ == '__main__':
    print('Scanning WiFi routers...\n')
    if sys.platform == 'win32':
        routers = scan_windows()
    else:
        routers = scan_linux()
    if not routers:
        print('Tidak ada router ditemukan. Coba jalankan dengan sudo.')
        sys.exit(1)
    print(f"  {'BSSID':<22} {'SSID':<22} {'Band':<8} {'Ch':<5} {'RSSI'}")
    print('-' * 70)
    for r in routers:
        marker = '  ← kemungkinan router sendiri' if r['rssi'] > -60 else ''
        print(f"  {r['bssid']:<22} {r['ssid']:<22} {r['band']:<8} {r['channel']:<5} {r['rssi']} dBm{marker}")
    print('\nSalin BSSID router MILIKMU (biasanya RSSI > -65 dBm)')
    print("Gunakan dengan: python main.py --bssids 'AA:BB:CC:...' 'AA:BB:CC:...'")