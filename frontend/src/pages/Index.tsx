
import React, { useState } from 'react';
import PixelCanvas from '../components/PixelCanvas';
import ColorPicker from '../components/ColorPicker';
import Header from '../components/Header';

const Index: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState("#00f2ff"); // Default to neon blue
  
  const canvasWidth = 1000;
  const canvasHeight = 1000;
  const pixelSize = 10;
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <PixelCanvas 
          width={canvasWidth}
          height={canvasHeight}
          pixelSize={pixelSize}
          selectedColor={selectedColor}
        />
        <ColorPicker 
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      </div>
    </div>
  );
};

export default Index;
