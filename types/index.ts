export type TileValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Board = TileValue[][]; // 4x4

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type ActionType = "MOVE_UP" | "MOVE_DOWN" | "MOVE_LEFT" | "MOVE_RIGHT" | "ADD_TILE" | "SYNC";

export interface HistoryEntry {
  type: ActionType;
  boardBefore: Board;
  boardAfter: Board;
  tileAdded?: { value: TileValue; row: number; col: number };
}

export interface GameState {
  board: Board;
  history: HistoryEntry[];
}

export interface MoveEvaluation {
  direction: Direction;
  score: number;
  boardAfter: Board;
}

export type DangerLevel = "SAFE" | "MEDIUM" | "HIGH_RISK" | "CRITICAL";

export interface SolverResult {
  bestMove: Direction;
  confidence: number;
  dangerLevel: DangerLevel;
  rankings: MoveEvaluation[];
  reasons: string[];
}

export const TILE_COLORS: Record<TileValue, string> = {
  0: "bg-tile-0",
  1: "bg-tile-1 text-white",
  2: "bg-tile-2 text-white",
  3: "bg-tile-3 text-white",
  4: "bg-tile-4 text-white",
  5: "bg-tile-5 text-white",
  6: "bg-tile-6 text-white",
  7: "bg-tile-7 text-black",
  8: "bg-tile-8 text-black",
  9: "bg-tile-9 text-black",
  10: "bg-tile-10 text-black",
  11: "bg-tile-10 text-white border-2 border-yellow-400", // New style for 11
};