import serial
import json
import asyncio
import numpy as np
from typing import AsyncGenerator, Optional
from .config import Config
from .logger import get_logger
logger = get_logger(__name__)
class CSIReceiver:
    def __init__(self, config: Config):
        self.port = config.esp32_port
        self.baudrate = config.baudrate
        self.known_bssids = set((b.upper() for b in config.known_router_bssids))
        self.serial: Optional[serial.Serial] = None
        self._packet_count = 0
        self._error_count = 0
    def connect(self) -> None:
        self.serial = serial.Serial(port=self.port, baudrate=self.baudrate, timeout=1.0, bytesize=serial.EIGHTBITS, parity=serial.PARITY_NONE, stopbits=serial.STOPBITS_ONE)
        logger.info('ESP32 connected', port=self.port, baudrate=self.baudrate)
    async def stream(self) -> AsyncGenerator[dict, None]:
        if not self.serial or not self.serial.is_open:
            self.connect()
        loop = asyncio.get_event_loop()
        while True:
            try:
                line = await loop.run_in_executor(None, self.serial.readline)
            except serial.SerialException as e:
                logger.error('Serial error', error=str(e))
                await asyncio.sleep(1.0)
                continue
            if not line:
                continue
            try:
                raw = json.loads(line.decode('utf-8').strip())
                packet = self._parse(raw)
                if packet is not None:
                    self._packet_count += 1
                    yield packet
            except (json.JSONDecodeError, UnicodeDecodeError, KeyError, ValueError) as e:
                self._error_count += 1
                if self._error_count % 100 == 0:
                    logger.warning('Parse errors', count=self._error_count)
    def _parse(self, raw: dict) -> Optional[dict]:
        bssid = raw.get('bssid', 'UNKNOWN').upper()
        if self.known_bssids and bssid not in self.known_bssids:
            return None
        buf = raw.get('buf', [])
        if len(buf) < 2:
            return None
        buf_arr = np.array(buf, dtype=np.int8)
        i_vals = buf_arr[0::2].astype(np.float32)
        q_vals = buf_arr[1::2].astype(np.float32)
        n = min(len(i_vals), len(q_vals))
        csi_complex = i_vals[:n] + 1j * q_vals[:n]
        return {'timestamp': raw.get('ts', 0), 'channel': raw.get('ch', 0), 'bssid': bssid, 'rssi': raw.get('rssi', -99), 'amplitude': np.abs(csi_complex), 'n_subcarriers': n}
    def disconnect(self) -> None:
        if self.serial and self.serial.is_open:
            self.serial.close()
            logger.info('ESP32 disconnected')
    @property
    def stats(self) -> dict:
        return {'packets': self._packet_count, 'errors': self._error_count}