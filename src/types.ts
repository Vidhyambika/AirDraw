export type AppMode = 'Draw' | 'Erase' | 'Hover' | 'Pause';
export type WaitMode = 'Loading';

export type Point = {
  x: number;
  y: number;
};

export type Path = {
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
};
