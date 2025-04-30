import os

MAP_WIDTH = int(os.getenv("MAP_WIDTH", 100))
MAP_HEIGHT = int(os.getenv("MAP_HEIGHT", 100))
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
UPDATE_CHANNEL = os.getenv("UPDATE_CHANNEL", "pixel_update")
BROADCAST_CHANNEL = os.getenv("BROADCAST_CHANNEL", "pixel_broadcast")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@127.0.0.1/pixelbattle")
