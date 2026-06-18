import { Board, Direction, MoveEvaluation, SolverResult } from "@/types";
import { applyMove } from "./merge";
import { isGameOver } from "./gameover";
import { evaluateDanger } from "./danger";
import { getPossibleMoves } from "./mobility";

const DIRECTIONS: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

// Chance nodes config
const SPAWN_PROBABILITIES = [
  { value: 1, probability: 0.9 },
  { value: 2, probability: 0.1 }
];

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
    return -1e10; // Massive penalty for dying
  }

  let score = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] > 0) {
        // Power scaling rewards higher tiles in correct positions
        score += Math.pow(board[r][c], 3) * WEIGHT_MATRIX[r][c];
      }
    }
  }

  // Priority A & E: Empty cells bonus (Survival)
  const emptyBonus = emptyCount * 100000;
  
  return score + emptyBonus;
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

    return hasValidMove ? maxScore : -1e10;
  } else {
    // Chance Node (Board spawns a random tile)
    if (emptyCells.length === 0) return evaluateLeaf(board, 0);

    let expectedScore = 0;
    
    // Speculation: JS Performance drop if we search all cells on empty boards.
    // Optimization: Sample max 4 random cells for chance nodes if board is open.
    const cellsToTest = emptyCells.length > 5 
      ? emptyCells.sort(() => 0.5 - Math.random()).slice(0, 4) 
      : emptyCells;

    const probMultiplier = emptyCells.length / cellsToTest.length;

    for (const cell of cellsToTest) {
      for (const spawn of SPAWN_PROBABILITIES) {
        const simBoard = cloneBoard(board);
        simBoard[cell.r][cell.c] = spawn.value as any;
        
        const prob = (spawn.probability / emptyCells.length) * probMultiplier;
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

  // Adaptive Depth: Search deeper only when the board gets crowded
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
      `Analyzed future spawn probabilities`,
    ],
  };
}