import React, {useEffect} from 'react';
import {COLORS} from "@/lib/constants.ts";

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({selectedColor, onSelectColor}) => {

  // Handle keyboard shortcuts for color selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < COLORS.length) {
          onSelectColor(COLORS[index]);
        }
      }
      else if (e.key === '0') {
        if (9 < COLORS.length) {
          onSelectColor(COLORS[9]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSelectColor]);

  return (
    <div className="neo-container p-4 m-4">
      <h3 className="text-sm font-medium mb-3">Select Color</h3>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color, index) => (
          <button
            key={color}
            className={`color-button ${color === selectedColor ? 'active' : ''}`}
            style={{backgroundColor: color}}
            onClick={() => onSelectColor(color)}
            title={`${color} (${index < 10 ? (index + 1) % 10 : ''})`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;