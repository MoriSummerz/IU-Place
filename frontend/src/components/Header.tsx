import React from "react";
import ConnectionStatus from "./ConnectionStatus";

const Header: React.FC = () => {
  return (
    <header className="py-4 px-6 w-full bg-background border-b border-white/5 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-4xl font-bold text-neon-green text-glow tracking-wide font-['Pixelify_Sans']">
          IU/place
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-muted-foreground">
            Server status
          </div>
          <ConnectionStatus />
        </div>
      </div>
    </header>
  );
};

export default Header;
