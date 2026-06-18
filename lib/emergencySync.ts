import { Board, TileValue } from "@/types";

export function parseBoardFromString(input: string): { board: Board; error?: string } {
  const lines = input.trim().split("\n");
  if (lines.length !== 4) {
    return { board: [] as unknown as Board, error: "Input must have exactly 4 lines." };
  }

  const board: TileValue[][] = [];
  for (let i = 0; i < 4; i++) {
    const nums = lines[i].trim().split(/\s+/).map(Number);
    if (nums.length !== 4) {
      return { board: [] as unknown as Board, error: `Line ${i + 1} must have exactly 4 numbers.` };
    }
    for (const n of nums) {
      if (![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(n)) {
        return { board: [] as unknown as Board, error: "Values must be 0-10." };
      }
    }
    board.push(nums as TileValue[]);
  }
  return { board: board as Board };
}