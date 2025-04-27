from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, insert
from .models import Base, Pixel

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@127.0.0.1/pixelbattle"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Database initialized.")


async def get_pixel(x: int, y: int) -> Pixel:
    async with AsyncSessionLocal() as session:
        async with session.begin():
            pixel = await session.get(Pixel, (x, y))
            return pixel

async def get_all_pixels() -> list[Pixel]:
    async with AsyncSessionLocal() as session:
        async with session.begin():
            result = await session.execute(select(Pixel))
            pixels = result.scalars().all()
            return pixels

async def create_pixel(x: int, y: int, color: int):
    async with AsyncSessionLocal() as session:
        async with session.begin():
            pixel = await session.get(Pixel, (x, y))
            if not pixel:
                pixel = Pixel(x=x, y=y, color=color)
                session.add(pixel)
                await session.commit()
                return True
            return False


async def initialize_all_pixels(width: int, height: int, color: int = 0):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Pixel.x, Pixel.y))
        existing_pixels = set(result.all())
        for x in range(width):
            missing_pixels = []
            for y in range(height):
                if (x, y) not in existing_pixels:
                    missing_pixels.append(Pixel(x=x, y=y, color=color))

            if missing_pixels:
                session.add_all(missing_pixels)
                await session.commit()



async def update_pixel(x: int, y: int, color: str):
    async with AsyncSessionLocal() as session:
        async with session.begin():
            pixel = await session.get(Pixel, (x, y))
            if pixel:
                pixel.color = color
                await session.commit()
                return True
            return False