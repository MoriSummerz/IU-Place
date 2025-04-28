from repositories.pixel_repository import PixelRepository
from config import MAP_WIDTH, MAP_HEIGHT
from fastapi import HTTPException
from schemas.canvas import Canvas


class CanvasService:
    def __init__(self, pixel_repository: PixelRepository):
        self.pixel_repository = pixel_repository

    async def get_canvas(self) -> dict:
        try:
            return Canvas(
                pixels=await self.pixel_repository.get_pixels(),
                width=MAP_WIDTH,
                height=MAP_HEIGHT,
            )
        except Exception as e:
            return HTTPException(
                status_code=500,
                detail=f"An error occurred while retrieving the canvas: {str(e)}",
            )
