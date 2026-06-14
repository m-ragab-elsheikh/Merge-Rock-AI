import { Board, TileValue } from "@/types";

export function addTile(
  board: Board,
  value: TileValue,
  row: number,
  col: number
): { board: Board; error?: string } {
  if (row < 1 || row > 4 || col < 1 || col > 4) {
    return { board, error: "Row and column must be between 1 and 4." };
  }
  if (value < 1 || value > 10) {
    return { board, error: "Value must be between 1 and 10." };
  }
  if (board[row - 1][col - 1] !== 0) {
    return { board, error: "Cell is not empty." };
  }

  const newBoard = board.map((r) => [...r]) as Board;
  newBoard[row - 1][col - 1] = value as TileValue;
  return { board: newBoard };
}