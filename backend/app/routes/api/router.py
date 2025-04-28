from fastapi import APIRouter
from .ws.router import router as ws_router
from .canvas.router import router as canvas_router

router = APIRouter(prefix="/api", tags=["api"])
router.include_router(ws_router, prefix="/ws", tags=["websocket"])
router.include_router(canvas_router, prefix="/canvas", tags=["canvas"])
