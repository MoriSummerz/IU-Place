from fastapi import WebSocket, WebSocketDisconnect
from typing import List
from pixel_packet import PixelPacket
from redis_client import RedisClient
import asyncio
from prometheus_client import Gauge, Counter


class WebsocketService:
    def __init__(self, redis_client: RedisClient):
        self.active_connections: List[WebSocket] = []
        self.redis_client = redis_client
        self.redis_client.set_websocket_service(self)
        self.connection_gauge = Gauge("websocket_connections", "Number of active websocket connections")
        self.received_messages_counter = Counter("websocket_received_messages", "Number of messages received from websocket clients")
        self.sent_message_counter = Counter("websocket_sent_messages", "Number of messages sent to websocket clients")

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_gauge.inc()

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            self.connection_gauge.dec()

    async def handle_connection(self, websocket: WebSocket):
        await self.connect(websocket)
        try:
            while True:
                data = await websocket.receive_bytes()
                self.received_messages_counter.inc()
                packet = PixelPacket.from_bytes(data)
                if packet is None:
                    await websocket.send_text("Invalid packet format")
                    continue
                await self.redis_client.publish(f"{packet.x},{packet.y},{packet.color}")
                self.sent_message_counter.inc()
        except WebSocketDisconnect:
            await self.disconnect(websocket)

    async def broadcast(self, payload: bytes):
        await asyncio.gather(
            *[self.send_broadcast_to_client(connection, payload) for connection in self.active_connections]
        )

    async def send_broadcast_to_client(self, connection: WebSocket, payload: bytes):
        try:
            await connection.send_bytes(payload)
            self.sent_message_counter.inc()
        except RuntimeError:
            await self.disconnect(connection)
        except Exception as e:
            print(f"Error sending bytes to client: {e}")
