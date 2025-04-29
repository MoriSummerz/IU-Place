import React, { useRef, useState, useEffect, useCallback } from "react";
import { useCanvas, indexToColor } from "@/context/CanvasContext";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const CanvasGrid: React.FC = () => {
  const { canvas, paintPixel, selectedColor, selectedPosition, setSelectedPosition } = useCanvas();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(5); // Initial scale
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
  const isMobile = useIsMobile();

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width * scale, canvas.height * scale);

    // Draw background grid
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width * scale, canvas.height * scale);

    // Draw pixels
    Object.values(canvas.pixels).forEach(pixel => {
      ctx.fillStyle = indexToColor(pixel.color);
      ctx.fillRect(pixel.x * scale, pixel.y * scale, scale, scale);
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;

    // Only draw grid lines if scale is large enough
    if (scale >= 3) {
      for (let x = 0; x <= canvas.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, canvas.height * scale);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvas.width * scale, y * scale);
        ctx.stroke();
      }
    }

    // Draw hovered pixel highlight
    if (hoveredPixel) {
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoveredPixel.x * scale, hoveredPixel.y * scale, scale, scale);
    }

    // Draw selected pixel highlight
    if (selectedPosition) {
      ctx.strokeStyle = '#00FF41';
      ctx.lineWidth = 2;
      ctx.strokeRect(selectedPosition.x * scale, selectedPosition.y * scale, scale, scale);
    }
  }, [canvas, scale, hoveredPixel, selectedPosition]);

  // Initialize and update canvas
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvas.width * scale;
      canvasRef.current.height = canvas.height * scale;
      drawCanvas();
    }
  }, [canvas, scale, drawCanvas]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setScale(prev => Math.max(5, Math.min(20, prev + delta)));
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle mouse move for dragging and hover
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = Math.floor((e.clientX - rect.left) / scale);
        const y = Math.floor((e.clientY - rect.top) / scale);
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          setHoveredPixel({ x, y });
        } else {
          setHoveredPixel(null);
        }
      }
    }
  }, [isDragging, dragStart, canvas.width, canvas.height, scale]);

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse leave to end dragging and clear hover
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHoveredPixel(null);
  }, []);

  // Handle clicks to paint pixels
  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = Math.floor((e.clientX - rect.left) / scale);
      const y = Math.floor((e.clientY - rect.top) / scale);
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        setSelectedPosition({ x, y });
      }
    }
  }, [canvas.width, canvas.height, scale, setSelectedPosition]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      // Handle pinch to zoom
      e.preventDefault();
      const touchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setDragStart({ x: touchDistance, y: 0 });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      // Handle pinch to zoom
      e.preventDefault();
      const touchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = touchDistance - dragStart.x;
      if (Math.abs(delta) > 5) {
        const zoomDelta = delta > 0 ? 1 : -1;
        setScale(prev => Math.max(1, Math.min(20, prev + zoomDelta)));
        setDragStart({ x: touchDistance, y: 0 });
      }
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseUp, handleTouchEnd]);

  return (
    <div className="flex flex-col items-center h-full">
      <div 
        ref={containerRef}
        className="relative overflow-hidden border border-white/10 rounded-lg bg-background shadow-lg h-full w-full"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div 
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="touch-none"
          />
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            variant="outline"
            className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary px-2"
            onClick={() => setScale(prev => Math.max(1, prev - 1))}
          >
            -
          </Button>
          <Button
            variant="outline" 
            className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary px-2"
            onClick={() => setScale(prev => Math.min(20, prev + 1))}
          >
            +
          </Button>
          <Button
            variant="outline"
            className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
            onClick={() => {
              setOffset({ x: 0, y: 0 });
              setScale(4);
            }}
          >
            Reset
          </Button>
        </div>
        {hoveredPixel && (
          <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm">
            X: {hoveredPixel.x}, Y: {hoveredPixel.y}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasGrid;
