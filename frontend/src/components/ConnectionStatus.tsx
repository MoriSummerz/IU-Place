
import React from "react";
import { useCanvas } from "@/context/CanvasContext";

const ConnectionStatus: React.FC = () => {
  const { connectionStatus } = useCanvas();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-neon-green animate-connection-active';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-xs">{getStatusText()}</span>
    </div>
  );
};

export default ConnectionStatus;
