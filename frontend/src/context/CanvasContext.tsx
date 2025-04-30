import React, {createContext, useContext, useEffect, useState, useCallback, useRef} from "react";
import {toast} from "@/components/ui/sonner";

// Define types
export interface Pixel {
  x: number;
  y: number;
  color: number;
}

export interface CanvasState {
  width: number;
  height: number;
  pixels: Record<string, Pixel>;
}

interface CanvasContextType {
  canvas: CanvasState;
  selectedColor: number;
  setSelectedColor: (color: number) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  paintPixel: (x: number, y: number) => void;
  selectedPosition: { x: number, y: number } | null;
  setSelectedPosition: (pos: { x: number, y: number } | null) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};

export const COLOR_PALETTE = [
  '#222222', // Black - 0
  '#E4E4E4', // White - 1
  '#E50000', // Red - 2
  '#00E500', // Green - 3
  '#0000E5', // Blue - 4
  '#E5E500', // Yellow - 5
  '#E500E5', // Magenta - 6
  '#00E5E5', // Cyan - 7
  '#FFA500', // Orange - 8
  '#800080', // Purple - 9
];

export const indexToColor = (index: number): string => {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

export const colorToIndex = (color: string): number => {
  const index = COLOR_PALETTE.indexOf(color);
  return index >= 0 ? index : 0;
};

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [canvas, setCanvas] = useState<CanvasState>({
    width: 100,
    height: 100,
    pixels: {},
  });
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const socketRef = useRef<WebSocket | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);

  // Fetch initial canvas state
  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        const response = await fetch('/api/canvas/');
        if (!response.ok) {
          throw new Error('Failed to fetch canvas');
        }
        const data = await response.json();

        // Convert array of pixels to a map for faster lookup
        const pixelMap: Record<string, Pixel> = {};
        data.pixels.forEach((pixel: Pixel) => {
          pixelMap[`${pixel.x},${pixel.y}`] = pixel;
        });

        setCanvas({
          width: data.width,
          height: data.height,
          pixels: pixelMap,
        });
      } catch (error) {
        console.error('Error fetching canvas:', error);
        toast.error('Failed to load canvas data');
      }
    };

    fetchCanvas();
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      const socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://` +
        `${window.location.host}/api/ws/`
      );

      socket.onopen = () => {
        setConnectionStatus('connected');
        toast.success('Connected to server');
      };

      socket.onclose = () => {
        setConnectionStatus('disconnected');
        toast.error('Disconnected from server');
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error occurred');
      };

      socket.onmessage = (event) => {
        // Handle binary data
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const view = new DataView(arrayBuffer);
            const x = view.getUint16(0, false); // Big-endian
            const y = view.getUint16(2, false); // Big-endian
            const colorIndex = view.getUint8(4);

            setCanvas(prevCanvas => {
              const newPixels = {...prevCanvas.pixels};
              newPixels[`${x},${y}`] = {x, y, color: colorIndex};
              return {...prevCanvas, pixels: newPixels};
            });
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      socketRef.current = socket;

      return () => {
        socket.close();
      };
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Function to paint a pixel
  const paintPixel = useCallback((x: number, y: number) => {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }

    if (canvas.pixels[`${x},${y}`]?.color === selectedColor) {
      toast.error('Pixel already painted with the same color');
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const buffer = new ArrayBuffer(5); // 2 bytes for x, 2 for y, 1 for color
      const view = new DataView(buffer);

      // Write data in big-endian format (>HHB)
      view.setUint16(0, x, false); // x coordinate (big-endian)
      view.setUint16(2, y, false); // y coordinate (big-endian)
      view.setUint8(4, selectedColor); // color index

      // Send binary data
      socketRef.current.send(buffer);

      // Optimistically update the UI
      setCanvas(prevCanvas => {
        const newPixels = {...prevCanvas.pixels};
        newPixels[`${x},${y}`] = {x, y, color: selectedColor};
        return {...prevCanvas, pixels: newPixels};
      });
      toast.success('Pixel painted successfully');
    } else {
      toast.error('Not connected to server');
    }
  }, [canvas.width, canvas.height, selectedColor]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we're in an input element, don't handle the key press
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (selectedPosition) {
        let {x, y} = selectedPosition;

        switch (e.key) {
          case 'ArrowUp':
            y = Math.max(0, y - 1);
            e.preventDefault();
            break;
          case 'ArrowDown':
            y = Math.min(canvas.height - 1, y + 1);
            e.preventDefault();
            break;
          case 'ArrowLeft':
            x = Math.max(0, x - 1);
            e.preventDefault();
            break;
          case 'ArrowRight':
            x = Math.min(canvas.width - 1, x + 1);
            e.preventDefault();
            break;
          case ' ':
            paintPixel(x, y);
            e.preventDefault();
            break;
          default:
            // Handle number keys 0-9 for color selection
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 0 && num < 10) {
              setSelectedColor(num);
              e.preventDefault();
            }
            break;
        }

        if (x !== selectedPosition.x || y !== selectedPosition.y) {
          setSelectedPosition({x, y});
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // If no pixel is selected, select the center of the canvas
        setSelectedPosition({
          x: Math.floor(canvas.width / 2),
          y: Math.floor(canvas.height / 2)
        });
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas.width, canvas.height, selectedPosition, paintPixel]);

  const value = {
    canvas,
    selectedColor,
    setSelectedColor,
    connectionStatus,
    paintPixel,
    selectedPosition,
    setSelectedPosition,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};
