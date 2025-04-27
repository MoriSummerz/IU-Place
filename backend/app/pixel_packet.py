import struct


class PixelPacket:
    def __init__(self, x: int, y: int, color: int):
        self.x = x
        self.y = y
        self.color = color

    def to_bytes(self) -> bytes:
        return struct.pack(">HHB", self.x, self.y, self.color)

    @staticmethod
    def from_bytes(data: bytes):
        if len(data) != 5:
            return None
        try:
            x, y, color = struct.unpack(">HHB", data)
            return PixelPacket(x, y, color)
        except struct.error:
            return None
