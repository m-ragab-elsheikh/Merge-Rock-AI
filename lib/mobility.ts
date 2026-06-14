import { Board, Direction } from "@/types";
import { isValidMove } from "./moves";

export function getPossibleMoves(board: Board): Direction[] {
  const dirs: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
  return dirs.filter((d) => isValidMove(board, d));
}

export function countEmptyCells(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 0) count++;
    }
  }
  return count;
}