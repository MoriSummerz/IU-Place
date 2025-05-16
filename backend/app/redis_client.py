import asyncio
import redis.asyncio as redis
from pixel_packet import PixelPacket
from prometheus_client import Counter


class RedisClient:
    def __init__(
        self,
        host="localhost",
        port=6379,
        db=0,
        password=None,
        update_channel: str = "pixel_update",
        broadcast_channel: str = "pixel_broadcast",
    ):
        self.redis = redis.Redis(
            host=host, port=port, db=db, password=password, decode_responses=True
        )
        self.pubsub = self.redis.pubsub()
        self.update_channel = update_channel
        self.broadcast_channel = broadcast_channel
        self.task = None
        self.websocket_service = None

        print(f"Connected to Redis at {host}:{port}")

    async def handle_messages(self):
        async for message in self.pubsub.listen():
            try:
                if message["type"] != "message" or self.websocket_service is None:
                    continue
                x, y, color = map(int, message["data"].split(","))
                payload = PixelPacket(x, y, color).to_bytes()
                await self.websocket_service.broadcast(payload)
            except Exception as e:
                print(f"Error handling message: {e}")

    async def run(self):
        print(f"Subscribed to: {self.broadcast_channel}")
        await self.pubsub.subscribe(self.broadcast_channel)
        self.task = asyncio.create_task(self.handle_messages())

    def set_websocket_service(self, websocket_service):
        self.websocket_service = websocket_service

    async def stop(self):
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                print("Redis task cancelled.")

    async def publish(self, message):
        await self.redis.publish(self.update_channel, message)
