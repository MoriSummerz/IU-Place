from pydantic import BaseModel
from schemas.pixel import Pixel


class Canvas(BaseModel):
    width: int
    height: int
    pixels: list[Pixel]
