from redis_client import RedisClient
from services.websocket_service import WebsocketService

redis_client = RedisClient(
    host="localhost",
    port=6379,
    db=0,
    password=None
)
websocket_service = WebsocketService(redis_client)

def get_websocket_service() -> WebsocketService:
    return websocket_service