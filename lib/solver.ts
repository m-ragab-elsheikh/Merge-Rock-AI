import { Board, Direction, MoveEvaluation, SolverResult, DangerLevel } from "@/types";
import { applyMove } from "./merge";
import { isGameOver } from "./gameover";
import { evaluateDanger } from "./danger";
import { getPossibleMoves } from "./mobility";
const DIRECTIONS: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
const scoreCache =
  new Map<string, number>();

function scoreBoard(board: Board): number {
  const cacheKey =
  board
    .flat()
    .join(",");

const cached =
  scoreCache.get(cacheKey);

if (cached !== undefined) {
  return cached;
}
  let emptyCells = 0;
  let maxTile = 0;
  let tileCount10 = 0;
  let mobility = 0;
  let cornerBonus = 0;
  let clusterBonus = 0;
  let snakeBonus = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c];
      if (val === 0) emptyCells++;
      if (val > maxTile) maxTile = val;
      if (val === 10) tileCount10++;
    }
  }

  // Monotonicity (prefer high tiles in a corner)
  let monoScore = 0;
  // Check rows left->right decreasing
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] >= board[r][c + 1]) monoScore += 1;
      else monoScore -= 1;
    }
  }
  // Check columns up->down decreasing
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] >= board[r + 1][c]) monoScore += 1;
      else monoScore -= 1;
    }
  }

  // Smoothness (penalty for large differences)
  let smoothness = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      smoothness -= Math.abs(board[r][c] - board[r][c + 1]);
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      smoothness -= Math.abs(board[r][c] - board[r + 1][c]);
    }
  }

  // Merge potential: count adjacent equal tiles (not zeros)
  let mergePotential = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] !== 0 && board[r][c] === board[r][c + 1]) mergePotential++;
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] !== 0 && board[r][c] === board[r + 1][c]) mergePotential++;
    }
  }
const possibleMoves =
  getPossibleMoves(board);

mobility =
  possibleMoves.length;
  const corners = [
  board[0][0],
  board[0][3],
  board[3][0],
  board[3][3],
];
let stuckPenalty = 0;

if (mobility === 0) {
  stuckPenalty = -50000;
} else if (mobility === 1) {
  stuckPenalty = -15000;
} else if (mobility === 2) {
  stuckPenalty = -5000;
}

if (
  corners.some(
    corner => Number(corner) === maxTile
  )
) {
  cornerBonus = 5000;
}
const tiles = board
  .flat()
  .filter(v => v > 0)
  .sort((a, b) => b - a);

const topTiles = tiles.slice(0, 4);

for (let i = 0; i < topTiles.length - 1; i++) {
  const diff =
    Math.abs(
      Number(topTiles[i]) -
      Number(topTiles[i + 1])
    );

  clusterBonus +=
    Math.max(0, 1000 - diff * 100);
}
const snakePath = [
  board[0][0],
  board[0][1],
  board[0][2],
  board[0][3],

  board[1][3],
  board[1][2],
  board[1][1],
  board[1][0],

  board[2][0],
  board[2][1],
  board[2][2],
  board[2][3],

  board[3][3],
  board[3][2],
  board[3][1],
  board[3][0],
];

for (let i = 0; i < snakePath.length - 1; i++) {
  if (
    Number(snakePath[i]) >=
    Number(snakePath[i + 1])
  ) {
    snakeBonus += 300;
  } else {
    snakeBonus -= 300;
  }
}
  // Game over penalty
  const gameOverPenalty = isGameOver(board) ? -100000 : 0;

  // Weights (tuned heuristically)
const score =
  emptyCells * 10000 +
  maxTile * 500 +
  tileCount10 * 2000 +
  monoScore * 200 +
  smoothness * 10 +
  mergePotential * 500 +
  mobility * 1500 +
  cornerBonus +
  clusterBonus +
  snakeBonus +
  stuckPenalty +
  gameOverPenalty;

 scoreCache.set(
  cacheKey,
  score
);

return score;
}

export function getBestMove(board: Board): SolverResult {
  const startTime = performance.now();
  const evaluations: MoveEvaluation[] = [];

  for (const dir of DIRECTIONS) {
    const { newBoard, moved, merged } = applyMove(board, dir);
    if (!moved && !merged) {
      // Invalid move, skip
      continue;
    }
    let score = scoreBoard(newBoard);

const futureMoves = DIRECTIONS
  .map((futureDir) => {
    const future =
      applyMove(
        newBoard,
        futureDir
      );

    if (
      !future.moved &&
      !future.merged
    ) {
      return null;
    }

const futureScore =
  scoreBoard(future.newBoard);
const emptyCells =
  future.newBoard
    .flat()
    .filter(v => v === 0)
    .length;

const adaptiveDepth =
  emptyCells <= 2
    ? 4
    : emptyCells <= 5
    ? 3
    : 2;

const thirdMoves = DIRECTIONS
  .map((thirdDir) => {
    const third =
      applyMove(
        future.newBoard,
        thirdDir
      );

    if (
      !third.moved &&
      !third.merged
    ) {
      return null;
    }

const thirdScore =
  scoreBoard(third.newBoard);

const fourthMoves = DIRECTIONS
  .map((fourthDir) => {
    const fourth =
      applyMove(
        third.newBoard,
        fourthDir
      );

    if (
      !fourth.moved &&
      !fourth.merged
    ) {
      return null;
    }

    return scoreBoard(
      fourth.newBoard
    );
  })
  .filter(
    (v): v is number =>
      v !== null
  );

if (
  fourthMoves.length > 0
) {
  return (
    thirdScore +
    Math.max(...fourthMoves) * 0.10
  );
}

return thirdScore;
  })
  .filter(
    (v): v is number =>
      v !== null
  );

if (
  thirdMoves.length > 0
) {
const depthWeight =
  adaptiveDepth === 4
    ? 0.30
    : adaptiveDepth === 3
    ? 0.15
    : 0.05;

return (
  futureScore +
  Math.max(...thirdMoves) *
    depthWeight
);
}

return futureScore;
  })
  .filter(
    (v): v is number =>
      v !== null
  );

if (
  futureMoves.length > 0
) {
  const averageFuture =
    futureMoves.reduce(
      (sum, value) => sum + value,
      0
    ) / futureMoves.length;

  const bestFuture =
    Math.max(...futureMoves);

  score +=
    averageFuture * 0.2 +
    bestFuture * 0.2;
}
    evaluations.push({ direction: dir, score, boardAfter: newBoard });
  }

  // If no valid moves (shouldn't happen if game not over)
if (evaluations.length === 0) {

  const gameOver =
    isGameOver(board);

return {
  bestMove: "UP",
  confidence: 0,
  dangerLevel:
    gameOver
      ? "CRITICAL"
      : evaluateDanger(board),
  rankings: [],
  reasons: [],
};

}
  // Sort by score descending
  evaluations.sort((a, b) => b.score - a.score);
  const best = evaluations[0];

  // Confidence based on gap between best and second move

let confidence = 50;

if (evaluations.length > 1) {
  const second = evaluations[1];

  const gap =
    best.score - second.score;

  const relativeGap =
    gap / Math.max(best.score, 1);

  confidence = Math.round(
    50 + relativeGap * 200
  );

  confidence = Math.max(
    50,
    Math.min(95, confidence)
  );
}
const reasons: string[] = [];

const bestBoard = best.boardAfter;

const maxTile =
  Math.max(...bestBoard.flat());

const corners = [
  bestBoard[0][0],
  bestBoard[0][3],
  bestBoard[3][0],
  bestBoard[3][3],
];

if (
  corners.some(
    corner =>
      Number(corner) === maxTile
  )
) {
  reasons.push(
    "Keeps highest tile in corner"
  );
}

const mobility =
  getPossibleMoves(bestBoard).length;

if (mobility >= 3) {
  reasons.push(
    "Maintains board mobility"
  );
}

const emptyCount =
  bestBoard.flat()
    .filter(v => v === 0)
    .length;

if (emptyCount >= 4) {
  reasons.push(
    "Creates free space"
  );
}

const mergeMoves =
  getPossibleMoves(bestBoard).length;

if (mergeMoves > 1) {
  reasons.push(
    "Creates future opportunities"
  );
}


  const dangerLevel = evaluateDanger(board);
const endTime = performance.now();

console.log(
  `Solver time: ${(endTime - startTime).toFixed(2)} ms`
);

return {
  bestMove: best.direction,
  confidence,
  dangerLevel,
  rankings: evaluations,
  reasons,
};
}