from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.pixel import Pixel


class PixelRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_pixels(self):
        result = await self.db.execute(select(Pixel))
        return result.scalars().all()
