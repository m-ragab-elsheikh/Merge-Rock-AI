import { Board } from "@/types";
import { applyMove } from "./merge";

export function evaluateBoardV2(
  board: Board
)

: number {

  const tiles = board
    .flat()
    .filter(v => v > 0)
    .sort((a, b) => b - a);

  const maxTile =
    tiles.length > 0
      ? Number(tiles[0])
      : 0;

  const emptyCells =
    board.flat()
      .filter(v => v === 0)
      .length;
      function findTilePosition(
  value: number
) {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === value) {
        return { r, c };
      }
    }
  }

  return null;
}

  let score = 0;

  /*
   * Goal Progress
   */

if (tiles.includes(9 as any))
  score += 20000;

if (
  tiles.includes(9 as any) &&
  tiles.includes(8 as any)
)
  score += 40000;

if (
  tiles.includes(9 as any) &&
  tiles.includes(8 as any) &&
  tiles.includes(7 as any)
)
  score += 60000;

if (
  tiles.includes(9 as any) &&
  tiles.includes(8 as any) &&
  tiles.includes(7 as any) &&
  tiles.includes(6 as any)
)
  score += 100000;

  /*
   * Highest Tile
   */

  score += maxTile * 10000;

  /*
   * Empty Space
   */

  score += emptyCells * 2000;

  let pipelineScore = 0;

for (let level = 1; level <= 9; level++) {
  const count =
    tiles.filter(
      v => Number(v) === level
    ).length;

  if (count >= 2) {
    pipelineScore +=
      level * 3000;
  }
}

score += pipelineScore;

let chainBonus = 0;
let targetPathScore = 0;

const p9 = findTilePosition(9);
const p8 = findTilePosition(8);
const p7 = findTilePosition(7);
const p6 = findTilePosition(6);

function distance(
  a: { r: number; c: number } | null,
  b: { r: number; c: number } | null
) {
  if (!a || !b) return 999;

  return (
    Math.abs(a.r - b.r) +
    Math.abs(a.c - b.c)
  );
}

chainBonus += Math.max(
  0,
  20 - distance(p9, p8) * 5
) * 1000;

chainBonus += Math.max(
  0,
  20 - distance(p8, p7) * 5
) * 1000;

chainBonus += Math.max(
  0,
  20 - distance(p7, p6) * 5
) * 1000;

if (p9 && p8) {
  const d = distance(p9, p8);

  targetPathScore +=
    Math.max(0, 10 - d) * 20000;
}

if (p8 && p7) {
  const d = distance(p8, p7);

  targetPathScore +=
    Math.max(0, 10 - d) * 15000;
}

if (p7 && p6) {
  const d = distance(p7, p6);

  targetPathScore +=
    Math.max(0, 10 - d) * 10000;
}

score += targetPathScore;

score += chainBonus;

  return score;
  
}
export function debugBoardV2(
  board: Board
) {

  const tiles = board
    .flat()
    .filter(v => v > 0)
    .sort((a, b) => b - a);

  const maxTile =
    tiles.length > 0
      ? Number(tiles[0])
      : 0;

  const emptyCells =
    board.flat()
      .filter(v => v === 0)
      .length;

  let goalProgress = 0;


  let pipelineScore = 0;

  for (let level = 1; level <= 9; level++) {
    const count =
      tiles.filter(
        v => Number(v) === level
      ).length;

    if (count >= 2) {
      pipelineScore +=
        level * 3000;
    }
  }

  const maxTileScore =
    maxTile * 10000;

  const emptySpaceScore =
    emptyCells * 2000;
    function findTilePosition(
  value: number
) {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === value) {
        return { r, c };
      }
    }
  }

  return null;
}

let chainBonus = 0;

const p9 = findTilePosition(9);
const p8 = findTilePosition(8);
const p7 = findTilePosition(7);
const p6 = findTilePosition(6);

let targetPathScore = 0;

if (p9 && p8) {
  const d = distance(p9, p8);

  targetPathScore +=
    Math.max(0, 10 - d) * 20000;
}

if (p8 && p7) {
  const d = distance(p8, p7);

  targetPathScore +=
    Math.max(0, 10 - d) * 15000;
}

if (p7 && p6) {
  const d = distance(p7, p6);

  targetPathScore +=
    Math.max(0, 10 - d) * 10000;
}

function distance(
  a: { r: number; c: number } | null,
  b: { r: number; c: number } | null
) {
  if (!a || !b) return 999;

  return (
    Math.abs(a.r - b.r) +
    Math.abs(a.c - b.c)
  );
}

chainBonus += Math.max(
  0,
  20 - distance(p9, p8) * 5
) * 3000;

chainBonus += Math.max(
  0,
  20 - distance(p8, p7) * 5
) * 1000;

chainBonus += Math.max(
  0,
  20 - distance(p7, p6) * 5
) * 1000;

return {
  goalProgress,
  pipelineScore,
  maxTileScore,
  emptySpaceScore,
  chainBonus,
  total:
    goalProgress +
    pipelineScore +
    maxTileScore +
    emptySpaceScore +
    chainBonus,
};
}

export function compareBoardsV2(
  boardA: Board,
  boardB: Board
) {

  const scoreA =
    evaluateBoardV2(boardA);

  const scoreB =
    evaluateBoardV2(boardB);

  return {
    scoreA,
    scoreB,
    winner:
      scoreA > scoreB
        ? "A"
        : scoreB > scoreA
        ? "B"
        : "DRAW",
  };
}

function evaluateFutureBoard(
  board: Board
) {

  const directions = [
    "UP",
    "DOWN",
    "LEFT",
    "RIGHT",
  ] as const;

  let bestFuture = 0;

  for (const direction of directions) {

    const result =
      applyMove(
        board,
        direction
      );

    if (
      !result.moved &&
      !result.merged
    ) {
      continue;
    }

    const score =
      evaluateBoardV2(
        result.newBoard
      );

    bestFuture =
      Math.max(
        bestFuture,
        score
      );
  }

  return bestFuture;
}

export function getBestMoveV2(
  board: Board
) {

  const directions = [
    "UP",
    "DOWN",
    "LEFT",
    "RIGHT",
  ] as const;

let bestMove:
  "UP" | "DOWN" | "LEFT" | "RIGHT"
  = "UP";

let bestScore = -1;

  for (const direction of directions) {

    const result =
      applyMove(
        board,
        direction
      );

    if (
      !result.moved &&
      !result.merged
    ) {
      continue;
    }

const currentScore =
  evaluateBoardV2(
    result.newBoard
  );

const futureScore =
  evaluateFutureBoard(
    result.newBoard
  );

const score =
  currentScore +
  futureScore * 0.5;

    if (
      score > bestScore
    ) {
      bestScore = score;
      bestMove = direction;
    }
  }
if (bestScore === -1) {
  return {
    bestMove: "UP",
    score: 0,
  };
}
  return {
    bestMove,
    score: bestScore,
  };
}