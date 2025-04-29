
import React from "react";
import ColorPicker from "./ColorPicker";
import ConnectionStatus from "./ConnectionStatus";
import { useCanvas } from "@/context/CanvasContext";
import { Button } from "@/components/ui/button";

const Footer: React.FC = () => {
  const { paintPixel, selectedPosition } = useCanvas();
  
  const handlePaintSelected = () => {
    if (selectedPosition) {
      paintPixel(selectedPosition.x, selectedPosition.y);
    }
  };

  return (
    <footer className="w-full py-4 px-4 bg-background border-t border-white/5 sticky bottom-0 z-10">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="sm:hidden">
          <ConnectionStatus />
        </div>
        
        <div className="w-full max-w-md">
          <ColorPicker />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Button
            className="bg-neon-green text-black hover:bg-neon-green/80 w-full sm:w-auto"
            onClick={handlePaintSelected}
          >
            Paint Pixel
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Use arrow keys to navigate, space to paint</p>
            <p className="mt-1">Mouse wheel or pinch to zoom, drag to move</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
