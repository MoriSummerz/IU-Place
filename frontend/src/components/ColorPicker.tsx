
import React, { useEffect } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  // Predefined colors
  const colors = [
    '#FF3131', // Red - 1
    '#FF5E00', // Orange - 2
    '#FFDE59', // Yellow - 3
    '#7ED957', // Green - 4
    '#39ff14', // Neon Green - 5
    '#00CFFF', // Light Blue - 6
    '#00f2ff', // Neon Blue - 7
    '#5271FF', // Blue - 8
    '#8A2BE2', // Purple - 9
    '#FF1493', // Pink - 0
    '#FFFFFF', // White
    '#888888', // Gray
    '#000000', // Black
  ];

  // Handle keyboard shortcuts for color selection (numbers 1-9, 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-9 correspond to the first 9 colors
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < colors.length) {
          onSelectColor(colors[index]);
        }
      }
      // Key 0 corresponds to the 10th color
      else if (e.key === '0') {
        if (9 < colors.length) {
          onSelectColor(colors[9]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [colors, onSelectColor]);

  return (
    <div className="neo-container p-4 m-4">
      <h3 className="text-sm font-medium mb-3">Select Color</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <button
            key={color}
            className={`color-button ${color === selectedColor ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
            title={`${color} (${index < 10 ? (index + 1) % 10 : ''})`}
          />
        ))}
        <div className="flex items-center ml-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onSelectColor(e.target.value)}
            className="w-8 h-8 bg-transparent cursor-pointer"
            title="Custom color"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
