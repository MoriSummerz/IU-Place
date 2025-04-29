import React, { useRef, useState, useEffect } from 'react';
import { toast } from "sonner";
import { PixelWebSocketService, indexToColor, getWebSocketService } from '../services/websocketService';

interface PixelCanvasProps {
  width: number;
  height: number;
  pixelSize: number;
  selectedColor: string;
}

interface Pixel {
  x: number;
  y: number;
  color: string;
  lastModified?: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'ws://localhost:5123';

const PixelCanvas: React.FC<PixelCanvasProps> = ({ width, height, pixelSize, selectedColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [wsService, setWsService] = useState<PixelWebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const MIN_SCALE = 0.2;
  const MAX_SCALE = 5;
  const BOUNDARY_PADDING = 100;

  const [pixels, setPixels] = useState<Record<string, Pixel>>({});

  useEffect(() => {
    const service = getWebSocketService(API_URL);
    setWsService(service);

    service.onPixelUpdate((pixelData) => {
      const { x, y, colorIndex } = pixelData;
      const color = indexToColor(colorIndex);

      setPixels(prev => ({
        ...prev,
        [`${x},${y}`]: {
          x,
          y,
          color,
          lastModified: new Date()
        }
      }));
    });

    service.connect()
      .then(() => {
        setIsConnected(true);
        toast.success("Connected to pixel server");
      })
      .catch((error) => {
        console.error("Failed to connect to pixel server:", error);
        toast.error("Failed to connect to pixel server");
      });

    return () => {
      service.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;

    Object.values(pixels).forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
    });

    for (let x = 0; x <= width; x += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (selectedPixel) {
      ctx.strokeStyle = '#00f2ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedPixel.x * pixelSize,
        selectedPixel.y * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }, [width, height, pixelSize, pixels, selectedPixel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPixel && e.key.startsWith('Arrow')) {
        const pixelCountX = Math.floor(width / pixelSize);
        const pixelCountY = Math.floor(height / pixelSize);
        setSelectedPixel({
          x: Math.floor(pixelCountX / 2),
          y: Math.floor(pixelCountY / 2),
          color: '#121212'
        });
        return;
      }

      if (selectedPixel) {
        const pixelCountX = Math.floor(width / pixelSize);
        const pixelCountY = Math.floor(height / pixelSize);

        switch (e.key) {
          case 'ArrowLeft':
            if (selectedPixel.x > 0) {
              const newX = selectedPixel.x - 1;
              updateSelectedPixel(newX, selectedPixel.y);
            }
            break;
          case 'ArrowRight':
            if (selectedPixel.x < pixelCountX - 1) {
              const newX = selectedPixel.x + 1;
              updateSelectedPixel(newX, selectedPixel.y);
            }
            break;
          case 'ArrowUp':
            if (selectedPixel.y > 0) {
              const newY = selectedPixel.y - 1;
              updateSelectedPixel(selectedPixel.x, newY);
            }
            break;
          case 'ArrowDown':
            if (selectedPixel.y < pixelCountY - 1) {
              const newY = selectedPixel.y + 1;
              updateSelectedPixel(selectedPixel.x, newY);
            }
            break;
          case ' ': // Spacebar for painting
            e.preventDefault();
            handlePaintPixel();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPixel, width, height, pixelSize, selectedColor, wsService]);

  const updateSelectedPixel = (x: number, y: number) => {
    const pixelKey = `${x},${y}`;
    const existingPixel = pixels[pixelKey];

    const pixel: Pixel = {
      x: x,
      y: y,
      color: existingPixel?.color || '#121212',
      lastModified: existingPixel?.lastModified || new Date()
    };

    setSelectedPixel(pixel);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.98 : 1.02;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * zoomFactor));

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPosition = {
      x: mouseX - (mouseX - position.x) * zoomFactor,
      y: mouseY - (mouseY - position.y) * zoomFactor
    };

    const boundedPosition = applyBoundaryConstraints(newPosition, rect.width, rect.height, newScale);

    if (newScale !== scale) {
      setScale(newScale);
      setPosition(boundedPosition);

      if (newScale === MIN_SCALE && scale * zoomFactor < MIN_SCALE) {
        toast.info("Maximum zoom out reached");
      } else if (newScale === MAX_SCALE && scale * zoomFactor > MAX_SCALE) {
        toast.info("Maximum zoom in reached");
      }
    }
  };

  const applyBoundaryConstraints = (
    pos: { x: number; y: number },
    containerWidth: number,
    containerHeight: number,
    currentScale: number
  ) => {
    const scaledCanvasWidth = width * currentScale;
    const scaledCanvasHeight = height * currentScale;

    const minX = containerWidth - scaledCanvasWidth - BOUNDARY_PADDING;
    const maxX = BOUNDARY_PADDING;
    const minY = containerHeight - scaledCanvasHeight - BOUNDARY_PADDING;
    const maxY = BOUNDARY_PADDING;

    const finalX = scaledCanvasWidth < containerWidth
      ? (containerWidth - scaledCanvasWidth) / 2
      : Math.min(maxX, Math.max(minX, pos.x));

    const finalY = scaledCanvasHeight < containerHeight
      ? (containerHeight - scaledCanvasHeight) / 2
      : Math.min(maxY, Math.max(minY, pos.y));

    return { x: finalX, y: finalY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };

      const boundedPosition = applyBoundaryConstraints(
        newPosition,
        rect.width,
        rect.height,
        scale
      );

      setPosition(boundedPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !containerRef.current) return;

    if (isDragging) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pixelX = Math.floor((mouseX - position.x) / (pixelSize * scale));
    const pixelY = Math.floor((mouseY - position.y) / (pixelSize * scale));

    if (pixelX >= 0 && pixelX < width / pixelSize && pixelY >= 0 && pixelY < height / pixelSize) {
      const pixelKey = `${pixelX},${pixelY}`;
      const existingPixel = pixels[pixelKey];

      const pixel: Pixel = {
        x: pixelX,
        y: pixelY,
        color: existingPixel?.color || '#121212',
        lastModified: existingPixel?.lastModified || new Date()
      };

      setSelectedPixel(pixel);
    }
  };

  const handlePaintPixel = () => {
    if (!selectedPixel) {
      toast("Please select a pixel first");
      return;
    }

    const pixelKey = `${selectedPixel.x},${selectedPixel.y}`;

    if (pixels[pixelKey] && pixels[pixelKey].color === selectedColor) {
      toast("Pixel already painted with the same color");
      return;
    }

    setPixels(prev => ({
      ...prev,
      [pixelKey]: {
        ...selectedPixel,
        color: selectedColor,
        lastModified: new Date()
      }
    }));

    if (wsService && wsService.isConnected()) {
      const success = wsService.sendPixelUpdate(selectedPixel.x, selectedPixel.y, selectedColor);
      if (success) {
        toast.success("Pixel painted and sent to server!", {
          description: `Position: (${selectedPixel.x}, ${selectedPixel.y})`
        });
      } else {
        toast.error("Failed to send pixel update to server");
      }
    } else {
      toast("Pixel painted locally only (not connected to server)", {
        description: `Position: (${selectedPixel.x}, ${selectedPixel.y})`
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={containerRef}
        className="canvas-container flex-1 bg-[#121212]"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        tabIndex={0}
      >
        <div style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: `${width}px`,
          height: `${height}px`,
          position: 'absolute',
        }}>
          <canvas
            ref={canvasRef}
            className="pixel-canvas"
            width={width}
            height={height}
            style={{
              imageRendering: 'pixelated',
              width: `${width}px`,
              height: `${height}px`,
            }}
          />
        </div>
      </div>

      <div className="neo-container p-4 m-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected to pixel server' : 'Not connected to server'}
          </span>
        </div>

        {selectedPixel && (
          <div className="flex justify-between items-center flex-1 ml-4">
            <div>
              <p className="text-sm font-medium">
                Selected: ({selectedPixel.x}, {selectedPixel.y})
              </p>
              <p className="text-xs text-muted-foreground">
                Current color: <span style={{ color: selectedPixel.color }}>{selectedPixel.color}</span>
              </p>
            </div>
            <button
              onClick={handlePaintPixel}
              className="neo-glow px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium animate-pulse-glow"
            >
              Paint Pixel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelCanvas;