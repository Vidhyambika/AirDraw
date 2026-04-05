import type { AppMode } from '../types';
import { ArrowLeft, Hand, CheckCircle2, CircleDashed } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatusPanelProps {
  appMode: AppMode;
  isLoaded: boolean;
}

export const StatusPanel = ({ appMode, isLoaded }: StatusPanelProps) => {
  return (
    <div className="absolute left-6 top-6 z-20 flex flex-col gap-6 w-64">
      <button className="glass-panel w-fit px-4 py-2 flex items-center gap-2 hover:bg-white/80 transition-colors text-sm font-medium">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl tracking-tight">AirDraw</h1>
          {isLoaded ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              <CheckCircle2 size={12} />
              Ready
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full animate-pulse">
              <CircleDashed size={12} className="animate-spin" />
              Loading
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "glass-panel p-4 flex items-center justify-center font-bold text-lg transition-colors border-2",
        appMode === 'Draw' && "bg-green-500/20 border-green-500 text-green-600 dark:text-green-400",
        appMode === 'Erase' && "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400",
        appMode === 'Pause' && "bg-yellow-500/20 border-yellow-500 text-yellow-600 dark:text-yellow-400",
        appMode === 'Hover' && "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400"
      )}>
        {appMode} Mode
      </div>

      <div className="glass-panel p-5 mt-auto">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Hand size={14} />
          Gestures
        </h2>
        <ul className="space-y-3 text-sm font-medium">
          <li className="flex items-center gap-3">
            <span className="text-xl">👌</span> Pinch to Draw
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">✌️</span> Detach to Erase
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">✋</span> Palm to Hover
          </li>
          <li className="flex items-center gap-3">
            <span className="text-xl">✊</span> Fist to Pause
          </li>
        </ul>
      </div>
    </div>
  );
};
