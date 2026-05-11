import asyncio
import json
import time
import websockets
from websockets.server import WebSocketServerProtocol
from typing import Set, Callable, Optional
from .logger import get_logger
logger = get_logger(__name__)
class sweenexWebSocketServer:
    def __init__(self, host: str='0.0.0.0', port: int=8765):
        self.host = host
        self.port = port
        self.clients: Set[WebSocketServerProtocol] = set()
        self.frame_count = 0
        self.start_time = time.time()
        self._router_info: list = []
        self._on_reset_pca: Optional[Callable] = None
    def set_reset_pca_callback(self, callback: Callable) -> None:
        self._on_reset_pca = callback
    async def register(self, ws: WebSocketServerProtocol) -> None:
        self.clients.add(ws)
        logger.info('Client connected', total=len(self.clients), remote=ws.remote_address)
        await ws.send(json.dumps({'type': 'connected', 'version': '2.0', 'routers': self._router_info}))
    async def unregister(self, ws: WebSocketServerProtocol) -> None:
        self.clients.discard(ws)
        logger.info('Client disconnected', remaining=len(self.clients))
    async def broadcast(self, message: dict) -> None:
        if not self.clients:
            return
        data = json.dumps(message)
        dead: Set[WebSocketServerProtocol] = set()
        for ws in self.clients.copy():
            try:
                await ws.send(data)
            except (websockets.exceptions.ConnectionClosed, websockets.exceptions.ConnectionClosedError, websockets.exceptions.ConnectionClosedOK):
                dead.add(ws)
        for ws in dead:
            await self.unregister(ws)
    async def handler(self, ws: WebSocketServerProtocol) -> None:
        await self.register(ws)
        try:
            async for raw_msg in ws:
                try:
                    cmd = json.loads(raw_msg)
                    await self._handle_command(ws, cmd)
                except json.JSONDecodeError:
                    pass
        except (websockets.exceptions.ConnectionClosed, websockets.exceptions.ConnectionClosedError):
            pass
        finally:
            await self.unregister(ws)
    async def _handle_command(self, ws: WebSocketServerProtocol, cmd: dict) -> None:
        t = cmd.get('type', '')
        if t == 'ping':
            await ws.send(json.dumps({'type': 'pong'}))
        elif t == 'get_status':
            elapsed = time.time() - self.start_time
            fps = self.frame_count / elapsed if elapsed > 0 else 0.0
            await ws.send(json.dumps({'type': 'status', 'fps': round(fps, 2), 'frame_count': self.frame_count, 'clients': len(self.clients), 'routers': self._router_info, 'uptime': round(elapsed, 1)}))
        elif t == 'reset_pca':
            if self._on_reset_pca:
                self._on_reset_pca()
            await ws.send(json.dumps({'type': 'ack', 'cmd': 'reset_pca'}))
        elif t == 'set_threshold':
            await ws.send(json.dumps({'type': 'ack', 'cmd': 'set_threshold'}))
        elif t == 'get_routers':
            await ws.send(json.dumps({'type': 'routers', 'routers': self._router_info}))
    def update_router_info(self, info: list) -> None:
        self._router_info = info
    async def start(self) -> None:
        async with websockets.serve(self.handler, self.host, self.port, ping_interval=30, ping_timeout=10, max_size=1048576):
            logger.info('WebSocket server started', url=f'ws://{self.host}:{self.port}')
            await asyncio.Future()