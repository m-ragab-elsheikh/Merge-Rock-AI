import { Board, TileValue } from "@/types";
import { isValidMove } from "./moves";

export function isGameOver(board: Board): boolean {
  // Board full?
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  // Check possible merges horizontally
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (canMerge(board[r][c], board[r][c + 1])) return false;
    }
  }
  // Vertically
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (canMerge(board[r][c], board[r + 1][c])) return false;
    }
  }
  return true;
}

function canMerge(a: TileValue, b: TileValue): boolean {
  if (a === 0 || b === 0) return false;
  if (a === 10 && b === 10) return true;
  return a === b && a < 10;
}