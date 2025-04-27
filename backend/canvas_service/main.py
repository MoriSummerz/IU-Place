import asyncio
from redis_client import RedisClient
from db.database import init_db, initialize_all_pixels
from config import (
    MAP_HEIGHT,
    MAP_WEIGHT,
    REDIS_DB,
    REDIS_PORT,
    REDIS_HOST,
    REDIS_PASSWORD,
    UPDATE_CHANNEL,
    BROADCAST_CHANNEL,
)


async def main():
    await init_db()
    await initialize_all_pixels(MAP_WEIGHT, MAP_HEIGHT)

    redis_client = RedisClient(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        password=REDIS_PASSWORD,
        update_channel=UPDATE_CHANNEL,
        broadcast_channel=BROADCAST_CHANNEL,
    )
    await redis_client.run()


if __name__ == "__main__":
    asyncio.run(main())
