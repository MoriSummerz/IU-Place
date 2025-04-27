from fastapi import APIRouter
from .ws.router import router as ws_router
from .users.router import router as users_router

router = APIRouter(prefix="/api", tags=["api"])
router.include_router(ws_router, prefix="/ws", tags=["websocket"])
router.include_router(users_router, prefix="/users", tags=["users"])
