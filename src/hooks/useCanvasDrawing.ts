import { useRef, useState, useCallback, useEffect } from 'react';
import type { Path, Point } from '../types';

export const useCanvasDrawing = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const pathsRef = useRef<Path[]>([]);
  const undonePathsRef = useRef<Path[]>([]);
  const activePathRef = useRef<Path | null>(null);
  
  const [historySize, setHistorySize] = useState(0);
  const [undoneSize, setUndoneSize] = useState(0);

  const updateHistoryState = () => {
    setHistorySize(pathsRef.current.length);
    setUndoneSize(undonePathsRef.current.length);
  };

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  };

  const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    if (path.points.length === 0) return;
    
    ctx.beginPath();
    ctx.globalCompositeOperation = path.isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;

    const points = path.points;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.moveTo(points[0].x * w, points[0].y * h);

    if (points.length < 3) {
      const b = points[0];
      ctx.beginPath();
      ctx.arc(b.x * w, b.y * h, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      ctx.fillStyle = path.color;
      ctx.fill();
      ctx.closePath();
      return;
    }

    // Bezier curve interpolation
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x * w, points[i].y * h, xc * w, yc * h);
    }
    
    // curve through the last two points
    const last2 = points[points.length - 2];
    const last1 = points[points.length - 1];
    ctx.quadraticCurveTo(
      last2.x * w, last2.y * h,
      last1.x * w, last1.y * h
    );

    ctx.stroke();
  };

  const redrawAllPaths = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    
    // Clear whole canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    pathsRef.current.forEach(path => {
      drawPath(ctx, path);
    });
  }, []);

  const renderHoverState = useCallback((point: Point | null, color: string, size: number, isEraser: boolean) => {
    const canvas = hoverCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (point) {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, size / 2, 0, 2 * Math.PI);
      if (isEraser) {
        ctx.strokeStyle = '#ef4444'; // Red outline for eraser
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();
    }
  }, []);

  const startPath = useCallback((point: Point, color: string, size: number, isEraser: boolean) => {
    activePathRef.current = {
      points: [point],
      color,
      size,
      isEraser
    };
    
    // Clear redo stack on new action
    undonePathsRef.current = [];
    updateHistoryState();
  }, []);

  const addPointToPath = useCallback((point: Point, color: string, size: number, isEraser: boolean) => {
    if (!activePathRef.current) {
      startPath(point, color, size, isEraser);
      return;
    }
    
    activePathRef.current.points.push(point);
    
    // Draw only the new segment for performance
    const ctx = getCtx();
    if (ctx) {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const points = activePathRef.current.points;
      
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    }
  }, [startPath]);

  const endPath = useCallback(() => {
    if (activePathRef.current && activePathRef.current.points.length > 0) {
      pathsRef.current.push(activePathRef.current);
      activePathRef.current = null;
      redrawAllPaths(); // Redraw everything cleanly with bezier curves once path ends
      updateHistoryState();
    }
  }, [redrawAllPaths]);

  const undo = useCallback(() => {
    if (pathsRef.current.length === 0) return;
    const lastPath = pathsRef.current.pop();
    if (lastPath) {
      undonePathsRef.current.push(lastPath);
      redrawAllPaths();
      updateHistoryState();
    }
  }, [redrawAllPaths]);

  const redo = useCallback(() => {
    if (undonePathsRef.current.length === 0) return;
    const pathToRestore = undonePathsRef.current.pop();
    if (pathToRestore) {
      pathsRef.current.push(pathToRestore);
      redrawAllPaths();
      updateHistoryState();
    }
  }, [redrawAllPaths]);

  const clear = useCallback(() => {
    pathsRef.current = [];
    undonePathsRef.current = [];
    activePathRef.current = null;
    redrawAllPaths();
    updateHistoryState();
  }, [redrawAllPaths]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary canvas because we need to draw a solid background if it's transparent
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    
    const url = tempCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airdraw.png';
    a.click();
  }, []);

  // Handle window resize dynamically while retaining paths
  useEffect(() => {
    const handleResize = () => {
      const c = canvasRef.current;
      const hc = hoverCanvasRef.current;
      if (c && c.parentElement) {
         c.width = c.parentElement.clientWidth;
         c.height = c.parentElement.clientHeight;
      }
      if (hc && hc.parentElement) {
         hc.width = hc.parentElement.clientWidth;
         hc.height = hc.parentElement.clientHeight;
      }
      redrawAllPaths();
    };
    
    window.addEventListener('resize', handleResize);
    // Initial size
    setTimeout(handleResize, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawAllPaths]);

  return {
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
  };
};
