from redis_client import RedisClient
from services.websocket_service import WebsocketService
from config import (
    REDIS_DB,
    REDIS_PORT,
    REDIS_HOST,
    REDIS_PASSWORD,
    UPDATE_CHANNEL,
    BROADCAST_CHANNEL,
)

redis_client = RedisClient(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    update_channel=UPDATE_CHANNEL,
    broadcast_channel=BROADCAST_CHANNEL,
)
websocket_service = WebsocketService(redis_client)


def get_websocket_service() -> WebsocketService:
    return websocket_service
