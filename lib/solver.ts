import { Board, Direction, MoveEvaluation, SolverResult, DangerLevel } from "@/types";
import { applyMove } from "./merge";
import { isGameOver } from "./gameover";
import { evaluateDanger } from "./danger";
import { getPossibleMoves } from "./mobility";

const DIRECTIONS: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

// Perfect Snake Matrix to mathematically force a "Merge Pipeline" into the top-left
const WEIGHT_MATRIX = [
  [ 2**15, 2**14, 2**13, 2**12 ],
  [ 2**8,  2**9,  2**10, 2**11 ],
  [ 2**7,  2**6,  2**5,  2**4  ],
  [ 2**0,  2**1,  2**2,  2**3  ]
];

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]) as Board;
}

function getEmptyCells(board: Board): {r: number, c: number}[] {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push({r, c});
    }
  }
  return empty;
}

function evaluateLeaf(board: Board, emptyCount: number): number {
  if (emptyCount === 0 && isGameOver(board)) {
    return -1e12; // Massive penalty for dying
  }

  let snakeScore = 0;
  let smoothness = 0;
  let maxTile = 0;
  let maxTilePos = { r: 0, c: 0 };

  // البحث عن أكبر رقم وتحديد مكانه
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] > maxTile) {
        maxTile = board[r][c];
        maxTilePos = { r, c };
      }
    }
  }

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c];
      if (val > 0) {
        // 1. Snake Score: Reward large numbers in the correct matrix position
        snakeScore += Math.pow(val, 4) * WEIGHT_MATRIX[r][c];

        // 2. Smoothness: Guide the AI step-by-step by rewarding adjacent similar values
        if (c < 3 && board[r][c + 1] > 0) {
          const diff = Math.abs(val - board[r][c + 1]);
          if (diff === 0) smoothness += Math.pow(val, 3) * 20;
          else if (diff === 1) smoothness += Math.pow(val, 2) * 10;
          else smoothness -= Math.pow(diff, 2) * 50; // Penalize disjointed tiles
        }
        if (r < 3 && board[r + 1][c] > 0) {
          const diff = Math.abs(val - board[r + 1][c]);
          if (diff === 0) smoothness += Math.pow(val, 3) * 20;
          else if (diff === 1) smoothness += Math.pow(val, 2) * 10;
          else smoothness -= Math.pow(diff, 2) * 50;
        }
      }
    }
  }

  // 3. CORNER LOCK (القفل الصارم للزاوية): 
  // إذا لم يكن أكبر رقم في الزاوية (0,0)، قم بتطبيق عقوبة خرافية
  let cornerPenalty = 0;
  if (maxTilePos.r !== 0 || maxTilePos.c !== 0) {
    cornerPenalty = -Math.pow(maxTile, 6) * 10000; 
  }

  // 4. Survival: Non-linear empty bonus
  const emptyBonus = Math.pow(emptyCount, 3.5) * 25000;

  return snakeScore + smoothness + emptyBonus + cornerPenalty;
}

function expectimax(board: Board, depth: number, isMaximizing: boolean): number {
  const emptyCells = getEmptyCells(board);

  if (depth === 0 || (emptyCells.length === 0 && isMaximizing)) {
    return evaluateLeaf(board, emptyCells.length);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    let hasValidMove = false;

    for (const dir of DIRECTIONS) {
      const { newBoard, moved, merged } = applyMove(board, dir);
      if (!moved && !merged) continue;

      hasValidMove = true;
      const score = expectimax(newBoard, depth - 1, false);
      maxScore = Math.max(maxScore, score);
    }

    return hasValidMove ? maxScore : -1e12;
  } else {
    // Chance Node (Board spawns a random tile)
    if (emptyCells.length === 0) return evaluateLeaf(board, 0);

    const maxTile = Math.max(...board.flat());
    let possibleSpawns = [];
    
    // Dynamic Spawn Probabilities based on game progression
    if (maxTile >= 10) {
      possibleSpawns = [
        { value: 1, prob: 0.40 },
        { value: 2, prob: 0.25 },
        { value: 3, prob: 0.20 },
        { value: 4, prob: 0.10 },
        { value: 5, prob: 0.05 } // Spawn logic for level 5
      ];
    } else if (maxTile >= 8) {
      possibleSpawns = [
        { value: 1, prob: 0.50 },
        { value: 2, prob: 0.30 },
        { value: 3, prob: 0.15 },
        { value: 4, prob: 0.05 }
      ];
    } else if (maxTile >= 5) {
      possibleSpawns = [
        { value: 1, prob: 0.60 },
        { value: 2, prob: 0.25 },
        { value: 3, prob: 0.15 }
      ];
    } else {
      possibleSpawns = [
        { value: 1, prob: 0.80 },
        { value: 2, prob: 0.20 }
      ];
    }

    let expectedScore = 0;
    
    // Performance Optimization: Sample max 3 cells if board is empty to prevent lag
    const cellsToTest = emptyCells.length > 4 
      ? emptyCells.sort(() => 0.5 - Math.random()).slice(0, 3) 
      : emptyCells;

    const probMultiplier = emptyCells.length / cellsToTest.length;

    for (const cell of cellsToTest) {
      for (const spawn of possibleSpawns) {
        const simBoard = cloneBoard(board);
        simBoard[cell.r][cell.c] = spawn.value as any;
        
        const prob = (spawn.prob / emptyCells.length) * probMultiplier;
        expectedScore += prob * expectimax(simBoard, depth - 1, true);
      }
    }

    return expectedScore;
  }
}

export function getBestMove(board: Board): SolverResult {
  const startTime = performance.now();
  const evaluations: MoveEvaluation[] = [];
  const emptyCells = getEmptyCells(board).length;

  const searchDepth = emptyCells <= 3 ? 4 : (emptyCells <= 6 ? 3 : 2);

  for (const dir of DIRECTIONS) {
    const { newBoard, moved, merged } = applyMove(board, dir);
    if (!moved && !merged) continue;

    const score = expectimax(newBoard, searchDepth - 1, false);
    evaluations.push({ direction: dir, score, boardAfter: newBoard });
  }

  if (evaluations.length === 0) {
    return {
      bestMove: "UP",
      confidence: 0,
      dangerLevel: isGameOver(board) ? "CRITICAL" : evaluateDanger(board),
      rankings: [],
      reasons: ["Game Over. No valid moves."],
    };
  }

  evaluations.sort((a, b) => b.score - a.score);
  const best = evaluations[0];

  let confidence = 50;
  if (evaluations.length > 1) {
    const gap = best.score - evaluations[1].score;
    const relativeGap = gap / Math.max(Math.abs(best.score), 1);
    confidence = Math.round(50 + relativeGap * 100);
    confidence = Math.max(50, Math.min(95, confidence));
  }

  const dangerLevel = evaluateDanger(board);
  const endTime = performance.now();
  console.log(`Expectimax time: ${(endTime - startTime).toFixed(2)} ms (Depth: ${searchDepth})`);

  return {
    bestMove: best.direction,
    confidence,
    dangerLevel,
    rankings: evaluations,
    reasons: [
      `Searched ${searchDepth} steps ahead`,
      `Applied Corner Lock & Strict Smoothness`,
    ],
  };
}