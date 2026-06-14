import { Board, Direction } from "@/types";
import { applyMove } from "./merge";

export function isValidMove(board: Board, direction: Direction): boolean {
  const { moved, merged } = applyMove(board, direction);
  return moved || merged;
}