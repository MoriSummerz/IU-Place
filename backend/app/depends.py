from fastapi import Depends
from redis_client import RedisClient

from services.websocket_service import WebsocketService
from services.canvas_service import CanvasService

from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.pixel_repository import PixelRepository
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

def get_canvas_service(db: AsyncSession = Depends(get_db)):
    return CanvasService(PixelRepository(db))