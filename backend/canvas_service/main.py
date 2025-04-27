import asyncio
from redis_worker import RedisClient
from db.database import init_db, initialize_all_pixels
from config import MAP_HEIGHT, MAP_WEIGHT


async def main():
    await init_db()
    await initialize_all_pixels(MAP_WEIGHT, MAP_HEIGHT)

    redis_client = RedisClient()
    await redis_client.run()

if __name__ == "__main__":
    asyncio.run(main())