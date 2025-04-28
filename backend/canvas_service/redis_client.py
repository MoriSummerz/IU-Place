from db.database import update_pixel
import redis.asyncio as redis


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

        print(f"Connected to Redis at {host}:{port}")

    async def handle_messages(self):
        async for message in self.pubsub.listen():
            if message["type"] != "message":
                continue
            try:
                x, y, color = map(int, message["data"].split(","))
                result = await update_pixel(x, y, color)
                if not result:
                    print(f"Pixel not updated: x={x}, y={y}, color={color}")
                    continue
                await self.publish(message["data"])
            except Exception as e:
                print(f"Error processing message: {message['data']}, Error: {e}")

    async def run(self):
        print(f"Subscribed to: {self.update_channel}")
        await self.pubsub.subscribe(self.update_channel)
        await self.handle_messages()

    async def publish(self, message):
        await self.redis.publish(self.broadcast_channel, message)
