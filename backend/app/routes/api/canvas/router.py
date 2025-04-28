from fastapi import APIRouter, Depends
from depends import get_canvas_service
from services.canvas_service import CanvasService
from schemas.canvas import Canvas

router = APIRouter()


@router.get("/")
async def get_canvas(canvas_service: CanvasService = Depends(get_canvas_service)) -> Canvas:
    return await canvas_service.get_canvas()