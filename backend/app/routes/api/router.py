from fastapi import APIRouter
from .ws.router import router as ws_router

router = APIRouter(prefix="/api", tags=["api"])
router.include_router(ws_router, prefix="/ws", tags=["websocket"])
