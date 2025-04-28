import {COLORS} from "@/lib/constants.ts";

// Convert hex color to color index (0-255)
export const colorToIndex = (color: string): number => {
  const index = COLORS.indexOf(color);
  if (index === -1) {
    throw new Error(`Color not found: ${color}`);
  }
  return index + 1; // Adjust for 0-based index
};

// Convert color index to hex color
export const indexToColor = (index: number): string => {

  // Ensure index is within bounds
  if (index < 0 || index >= COLORS.length) {
    throw new Error(`Color index out of bounds: ${index}`);
  }
  return COLORS[index - 1]; // Adjust for 0-based index
};

export interface PixelData {
  x: number;
  y: number;
  color: string;
}

export interface PixelBinary {
  x: number;
  y: number;
  colorIndex: number;
}

// Convert PixelData to binary format
export const pixelToBinary = (pixel: PixelData): ArrayBuffer => {
  const buffer = new ArrayBuffer(5); // 2 bytes x + 2 bytes y + 1 byte color
  const view = new DataView(buffer);

  // Write data in big-endian format (>HHB)
  view.setUint16(0, pixel.x, false); // x coordinate (big-endian)
  view.setUint16(2, pixel.y, false); // y coordinate (big-endian)
  view.setUint8(4, colorToIndex(pixel.color)); // color index

  return buffer;
};

// Convert binary to PixelData
export const binaryToPixel = (buffer: ArrayBuffer): PixelBinary | null => {
  if (buffer.byteLength !== 5) return null;

  try {
    const view = new DataView(buffer);

    const x = view.getUint16(0, false); // big-endian
    const y = view.getUint16(2, false); // big-endian
    const colorIndex = view.getUint8(4);

    return {x, y, colorIndex};
  } catch (error) {
    console.error("Failed to parse pixel data:", error);
    return null;
  }
};

export class PixelWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private onPixelUpdateCallback: ((pixel: PixelBinary) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  constructor(apiUrl: string) {
    this.url = `${apiUrl}/api/ws/`;
  }

  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed', event);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            const pixelData = binaryToPixel(event.data);
            console.log("GOT PIXEL", pixelData);
            if (pixelData && this.onPixelUpdateCallback) {
              this.onPixelUpdateCallback(pixelData);
            }
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  sendPixelUpdate(x: number, y: number, color: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send pixel update');
      return false;
    }

    const pixelData: PixelData = {x, y, color};
    const binaryData = pixelToBinary(pixelData);
    this.ws.send(binaryData);
    return true;
  }

  onPixelUpdate(callback: (pixel: PixelBinary) => void) {
    this.onPixelUpdateCallback = callback;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

      this.reconnectTimeout = window.setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
let wsServiceInstance: PixelWebSocketService | null = null;

export const getWebSocketService = (apiUrl: string): PixelWebSocketService => {
  if (!wsServiceInstance) {
    wsServiceInstance = new PixelWebSocketService(apiUrl);
  }
  return wsServiceInstance;
};
