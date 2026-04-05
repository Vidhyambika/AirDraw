import type { RefObject } from 'react';

interface CanvasLayerProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hoverCanvasRef: RefObject<HTMLCanvasElement | null>;
}

export const CanvasLayer = ({ canvasRef, hoverCanvasRef }: CanvasLayerProps) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Base drawing canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {/* Hover cursor canvas on top to prevent drawing smudges */}
      <canvas
        ref={hoverCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
