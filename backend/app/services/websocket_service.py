from fastapi import WebSocket, WebSocketDisconnect
from typing import List
from pixel_packet import PixelPacket
from redis_client import RedisClient


class WebsocketService:
    def __init__(self, redis_client: RedisClient):
        self.active_connections: List[WebSocket] = []
        self.redis_client = redis_client
        self.redis_client.set_websocket_service(self)

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def handle_connection(self, websocket: WebSocket):
        await self.connect(websocket)
        try:
            while True:
                data = await websocket.receive_bytes()
                packet = PixelPacket.from_bytes(data)
                if packet is None:
                    await websocket.send_text("Invalid packet format")
                    continue
                print(f"Received packet: {packet.x}, {packet.y}, {packet.color}")
                await self.redis_client.publish(f"{packet.x},{packet.y},{packet.color}")
        except WebSocketDisconnect:
            await self.disconnect(websocket)

    async def broadcast(self, payload: bytes):
        for connection in self.active_connections:
            try:
                await connection.send_bytes(payload)
            except Exception as e:
                print(f"Error sending bytes: {e}")
