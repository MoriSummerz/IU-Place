
import React from 'react';
import {ZoomIn, ZoomOut, Move, Info, Space, ArrowDown01} from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="neo-container p-4 m-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pixel-neon to-pixel-purple bg-clip-text text-transparent">
            IU/place
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ZoomIn size={14}/> <ZoomOut size={14}/>
            <span>Scroll to zoom</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Move size={14}/>
            <span>Drag to move</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info size={14}/>
            <span>Click to select pixel</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Space size={14}/>
            <span>Space to paint</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowDown01 size={14}/>
            <span>0-9 to select a color</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
