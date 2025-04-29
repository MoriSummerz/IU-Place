
import React from "react";
import { useCanvas, COLOR_PALETTE } from "@/context/CanvasContext";

const ColorPicker: React.FC = () => {
  const { selectedColor, setSelectedColor } = useCanvas();

  return (
    <div className="w-full bg-secondary/90 rounded-lg p-2 glass-morphism">
      <div className="flex flex-wrap justify-center gap-2">
        {COLOR_PALETTE.slice(0, 16).map((color, index) => (
          <button
            key={index}
            className={`w-8 h-8 rounded-md transition-all duration-200 ${
              selectedColor === index 
                ? "ring-2 ring-neon-green shadow-[0_0_8px_rgba(0,255,65,0.5)]" 
                : "hover:scale-110"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(index)}
            title={`Color ${index}`}
            aria-label={`Select color ${index}`}
          />
        ))}
      </div>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        Press 0-9 keys to quickly select colors
      </div>
    </div>
  );
};

export default ColorPicker;
