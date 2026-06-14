import { Board, TileValue } from "@/types";

// Merge a single row to the left (used for LEFT and RIGHT by reversing)
export function mergeRowLeft(row: TileValue[]): {
  newRow: TileValue[];
  score: number;
  moved: boolean;
  merged: boolean;
} {
  // Remove zeros
  const nonZero = row.filter((v) => v !== 0) as TileValue[];
  const result: TileValue[] = [];
  let merged = false;
  let moved = false;
  let i = 0;

  while (i < nonZero.length) {
    if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
      const mergedValue = mergeTiles(nonZero[i], nonZero[i + 1]);
      result.push(mergedValue);
      i += 2;
      merged = true;
      moved = true;
    } else {
      result.push(nonZero[i]);
      i++;
    }
  }

  // Fill with zeros
  while (result.length < 4) {
    result.push(0 as TileValue);
  }

  // Check if any tile moved (different position)
  const originalRow = [...row];
  // Compare only non-zero positions
const finalRow = [...result];

moved =
  JSON.stringify(originalRow) !==
  JSON.stringify(finalRow);
  
  return { newRow: result as TileValue[], score: 0, moved, merged };
}

function mergeTiles(a: TileValue, b: TileValue): TileValue {
  if (a === 10 && b === 10) return 10;
  return (a + 1) as TileValue;
}

// Apply a move in a given direction
export function applyMove(board: Board, direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): {
  newBoard: Board;
  moved: boolean;
  merged: boolean;
} {
  const size = 4;
  const newBoard: Board = Array.from({ length: size }, () => Array(size).fill(0) as TileValue[]);
  let anyMoved = false;
  let anyMerged = false;

  if (direction === "LEFT") {
    for (let r = 0; r < size; r++) {
      const { newRow, moved, merged } = mergeRowLeft(board[r] as TileValue[]);
      newBoard[r] = newRow;
      if (moved || merged) anyMoved = true;
      if (merged) anyMerged = true;
    }
  } else if (direction === "RIGHT") {
    for (let r = 0; r < size; r++) {
      const reversed = [...board[r]].reverse() as TileValue[];
      const { newRow, moved, merged } = mergeRowLeft(reversed);
      newBoard[r] = newRow.reverse() as TileValue[];
      if (moved || merged) anyMoved = true;
      if (merged) anyMerged = true;
    }
  } else if (direction === "UP") {
    for (let c = 0; c < size; c++) {
      const col: TileValue[] = [];
      for (let r = 0; r < size; r++) col.push(board[r][c]);
      const { newRow, moved, merged } = mergeRowLeft(col);
      if (moved || merged) anyMoved = true;
      if (merged) anyMerged = true;
      for (let r = 0; r < size; r++) newBoard[r][c] = newRow[r];
    }
  } else if (direction === "DOWN") {
    for (let c = 0; c < size; c++) {
      const col: TileValue[] = [];
      for (let r = 0; r < size; r++) col.push(board[r][c]);
      const reversed = col.reverse() as TileValue[];
      const { newRow, moved, merged } = mergeRowLeft(reversed);
      if (moved || merged) anyMoved = true;
      if (merged) anyMerged = true;
      const resultCol = newRow.reverse() as TileValue[];
      for (let r = 0; r < size; r++) newBoard[r][c] = resultCol[r];
    }
  }

  return { newBoard, moved: anyMoved, merged: anyMerged };
}