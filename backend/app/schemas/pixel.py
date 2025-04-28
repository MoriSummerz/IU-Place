from pydantic import BaseModel


class Pixel(BaseModel):
    x: int
    y: int
    color: int

    class Config:
        from_attributes = True
