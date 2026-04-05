import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { WebcamLayer } from './components/WebcamLayer';
import { CanvasLayer } from './components/CanvasLayer';
import { StatusPanel } from './components/StatusPanel';
import { UIToolbar } from './components/UIToolbar';
import { useHandTracking } from './hooks/useHandTracking';
import { useCanvasDrawing } from './hooks/useCanvasDrawing';
import type { AppMode, Point } from './types';

function App() {
  const webcamRef = useRef<Webcam>(null);
  
  const [appMode, setAppMode] = useState<AppMode>('Hover');
  const [color, setColor] = useState('#eab308');
  const [brushSize, setBrushSize] = useState(8);
  const [eraserSize, setEraserSize] = useState(40);

  // Use refs for sizes/colors inside the high-frequency callback to avoid stale closures
  // without needing to add them to dependency arrays which triggers effect recompilation
  const settingsRef = useRef({ color, brushSize, eraserSize, appMode });
  
  useEffect(() => {
    settingsRef.current = { color, brushSize, eraserSize, appMode };
  }, [color, brushSize, eraserSize, appMode]);

  const {
    canvasRef,
    hoverCanvasRef,
    startPath,
    addPointToPath,
    endPath,
    renderHoverState,
    undo,
    redo,
    clear,
    download,
    historySize,
    undoneSize
  } = useCanvasDrawing();

  const handleFrame = useCallback((mode: AppMode, point: Point | null) => {
    const settings = settingsRef.current;
    
    // Only trigger React state update if mode actually changes
    if (mode !== settings.appMode) {
      setAppMode(mode);
    }

    const isEraser = mode === 'Erase';
    const currentSize = isEraser ? settings.eraserSize : settings.brushSize;

    if (mode === 'Draw' || mode === 'Erase') {
      if (point) {
        if (settings.appMode !== mode) {
           startPath(point, settings.color, currentSize, isEraser);
        } else {
           addPointToPath(point, settings.color, currentSize, isEraser);
        }
      }
    } else {
      // If we were drawing, end the path
      if (settings.appMode === 'Draw' || settings.appMode === 'Erase') {
        endPath();
      }
    }

    // Always render hover state for cursor (or hide if point is null)
    if (mode !== 'Pause') {
      renderHoverState(point, settings.color, currentSize, isEraser);
    } else {
      renderHoverState(null, settings.color, currentSize, isEraser);
    }
  }, [addPointToPath, endPath, renderHoverState]);

  // Pass the raw HTMLVideoElement from react-webcam to the hook
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const handleVideoLoad = useCallback(() => {
    if (webcamRef.current && webcamRef.current.video) {
        setVideoElement(webcamRef.current.video);
    }
  }, []);

  const { isLoaded } = useHandTracking(videoElement, handleFrame);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans selection:bg-white/30">
      <WebcamLayer webcamRef={webcamRef} onVideoLoad={handleVideoLoad} />
      
      <CanvasLayer 
        canvasRef={canvasRef} 
        hoverCanvasRef={hoverCanvasRef} 
      />

      <StatusPanel 
        appMode={appMode} 
        isLoaded={isLoaded} 
      />

      <UIToolbar
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
        onDownload={download}
        canUndo={historySize > 0}
        canRedo={undoneSize > 0}
      />
    </div>
  );
}

export default App;
