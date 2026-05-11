import asyncio
import argparse
from src.config import Config
from src.logger import get_logger
from src.csi_receiver import CSIReceiver
from src.multi_router_merger import MultiRouterMerger
from src.preprocessor import CSIPreprocessor
from src.motion_detector import MotionDetector
from src.ml_inference import PoseEstimator
from src.pose_assembler import assemble_skeleton
from src.websocket_server import sweenexWebSocketServer
logger = get_logger('main')
async def pipeline(config: Config, ws: sweenexWebSocketServer) -> None:
    receiver = CSIReceiver(config)
    merger = MultiRouterMerger(config)
    preprocessor = CSIPreprocessor(config)
    detector = MotionDetector(config)
    estimator = PoseEstimator(config)
    ws.set_reset_pca_callback(preprocessor.reset)
    logger.info('=== SWEENEX V1.0 Pipeline Starting ===')
    frame_id = 0
    async for packet in receiver.stream():
        merged = merger.update(packet)
        if merged is None:
            continue
        frame_id += 1
        clean = preprocessor.process(merged)
        motion, score = detector.detect(clean)
        pose_raw = estimator.predict(clean) if motion else None
        skeleton = assemble_skeleton(pose_raw)
        router_info = merger.get_router_info()
        ws.update_router_info(router_info)
        ws.frame_count = frame_id
        await ws.broadcast({'type': 'frame', 'frame_id': frame_id, 'timestamp': packet['timestamp'], 'motion': motion, 'motion_score': round(float(score), 4), 'rssi': packet['rssi'], 'bssid': packet['bssid'], 'pose': skeleton, 'routers': router_info})
        if frame_id % 200 == 0:
            logger.info('Pipeline status', frame=frame_id, motion=motion, score=round(score, 3), routers=len(merger.router_order), receiver=receiver.stats)
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='SWEENEX V1.0 Python Server')
    p.add_argument('--port', default='/dev/ttyUSB0', help='ESP32 serial port (Linux: /dev/ttyUSB0, Windows: COM3)')
    p.add_argument('--ws-port', type=int, default=8765, help='WebSocket server port (default: 8765)')
    p.add_argument('--model', default='models/sweenex_pose.onnx', help='Path ke ONNX model file')
    p.add_argument('--bssids', nargs='*', default=[], help='BSSID router yang dikenal (opsional, filter noise)')
    p.add_argument('--threshold', type=float, default=0.12, help='Motion detection threshold (default: 0.12)')
    return p.parse_args()
if __name__ == '__main__':
    args = parse_args()
    config = Config(esp32_port=args.port, ws_port=args.ws_port, model_path=args.model, known_router_bssids=args.bssids, motion_threshold=args.threshold)
    ws = sweenexWebSocketServer(host=config.ws_host, port=config.ws_port)
    async def run():
        await asyncio.gather(ws.start(), pipeline(config, ws))
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        logger.info('Server stopped by user')