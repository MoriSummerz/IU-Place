from fastapi import APIRouter, Depends
from fastapi.websockets import WebSocket
from depends import get_websocket_service
from services.websocket_service import WebsocketService

router = APIRouter()

@router.websocket("/")
async def websocket(
    websocket: WebSocket,
    service: WebsocketService = Depends(get_websocket_service)
):
    await service.handle_connection(websocket)