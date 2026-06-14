import { Board, DangerLevel } from "@/types";
import { getPossibleMoves, countEmptyCells } from "./mobility";

export function evaluateDanger(board: Board): DangerLevel {
  const emptyCells = countEmptyCells(board);
  const moves = getPossibleMoves(board);
  const mergeCount = countPossibleMerges(board);

if (
  emptyCells === 0 &&
  mergeCount === 0
) {
  return "CRITICAL";
}

if (
  emptyCells <= 2
) {
  return "HIGH_RISK";
}

if (
  emptyCells <= 5
) {
  return "MEDIUM";
}

return "SAFE";
}

function countPossibleMerges(board: Board): number {
  let count = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] !== 0 && board[r][c] === board[r][c + 1]) count++;
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] !== 0 && board[r][c] === board[r + 1][c]) count++;
    }
  }
  return count;
}