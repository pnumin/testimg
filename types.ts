export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DifferenceItem {
  id: string;
  description: string;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] 0-1000 scale
}

export interface AnalysisResult {
  differences: DifferenceItem[];
  summary: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}