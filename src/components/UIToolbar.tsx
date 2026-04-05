import { Undo2, Redo2, Trash2, Download, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

const COLORS = [
  '#000000', // Black
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
];

const SIZES = [
  { label: 'S', value: 4 },
  { label: 'M', value: 8 },
  { label: 'L', value: 16 }
];

const ERASER_SIZES = [
  { label: 'S', value: 20 },
  { label: 'M', value: 40 },
  { label: 'L', value: 80 }
];

interface UIToolbarProps {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  eraserSize: number;
  setEraserSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const UIToolbar = ({
  color, setColor,
  brushSize, setBrushSize,
  eraserSize, setEraserSize,
  onUndo, onRedo, onClear, onDownload,
  canUndo, canRedo
}: UIToolbarProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
      <div className="glass-panel p-3 flex flex-col items-center gap-4">
        {/* Color Palette */}
        <div className="grid grid-cols-2 gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform",
                color === c ? "scale-110 border-gray-400 dark:border-gray-300" : "border-transparent hover:scale-105",
                c === '#ffffff' && "border-gray-200"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-1" />

        {/* Brush Sizes */}
        <div className="flex flex-col items-center w-full gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Pen</span>
          <div className="flex gap-1">
            {SIZES.map(s => (
              <button
                key={s.label}
                onClick={() => setBrushSize(s.value)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-colors flex items-center justify-center",
                  brushSize === s.value ? "bg-gray-200 dark:bg-gray-800 text-black dark:text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-1" />

        {/* Eraser Sizes */}
        <div className="flex flex-col items-center w-full gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Eraser</span>
          <div className="flex gap-1">
            {ERASER_SIZES.map(s => (
              <button
                key={s.label}
                onClick={() => setEraserSize(s.value)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-colors flex items-center justify-center",
                  eraserSize === s.value ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-2 flex flex-col items-center gap-2">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Undo"
        >
          <Undo2 size={20} />
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Redo"
        >
          <Redo2 size={20} />
        </button>
        
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-800 my-1" />
        
        <button 
          onClick={onClear}
          className="p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 size={20} />
        </button>
        <button 
          onClick={onDownload}
          className="p-3 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          title="Download Image"
        >
          <Download size={20} />
        </button>
        
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-800 my-1" />
        
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};
