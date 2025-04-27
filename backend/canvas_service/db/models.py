from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer

Base = declarative_base()

class Pixel(Base):
    __tablename__ = "pixel"

    x = Column(Integer, primary_key=True)
    y = Column(Integer, primary_key=True)
    color = Column(Integer)