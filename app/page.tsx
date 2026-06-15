"use client";

import { useState, useEffect, useCallback } from "react";
import { Board } from "@/components/Board";
import { MoveRanking } from "@/components/MoveRanking";
import { DangerMeter } from "@/components/DangerMeter";
import { GameState, TileValue, SolverResult } from "@/types";
import { getBestMove } from "@/lib/solver";
import { initialState, addMoveToHistory, undoLast } from "@/lib/history";
import { applyMove } from "@/lib/merge";
import { addTile } from "@/lib/addTile";
import { parseBoardFromString } from "@/lib/emergencySync";

const STORAGE_KEY = "merge-solver-ai-state";

export default function HomePage() {
const [state, setState] = useState<GameState>(
  initialState()
);

const [solverResult, setSolverResult] =
  useState<SolverResult | null>(null);

const [error, setError] = useState("");



  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.board && parsed.history) {
          setState(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Recalculate solver on board change
  useEffect(() => {
    if (state.board) {
      const result = getBestMove(state.board);
      setSolverResult(result);
    }
  }, [state.board]);

  const performMove = useCallback(
    (direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
      const { newBoard, moved, merged } = applyMove(state.board, direction);
      if (!moved && !merged) {
        setError(`Move ${direction} is invalid (nothing moves or merges).`);
        return;
      }
      setError("");
      const updated = addMoveToHistory(
        state,
        `MOVE_${direction}` as "MOVE_UP",
        newBoard
      );
      setState(updated);
    },
    [state]
  );


  const handleUndo = useCallback(() => {
    const previous = undoLast(state);
    if (previous) {
      setState(previous);
      setError("");
    } else {
      setError("Nothing to undo.");
    }
  }, [state]);

  const handleClearBoard = useCallback(() => {
  const emptyBoard = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
] as any;

setState({
  board: emptyBoard,
  history: [],
});

  setError("");
}, []);

  const hasValidMove =
  solverResult &&
  solverResult.rankings.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex flex-col items-center gap-6">
<div className="text-center mb-2">
  <img
    src="/img/Mahmoud_Image.jpg"
    alt="Merge Rock AI"
    className="w-24 h-24 object-contain mx-auto"
  />
  <h1 className="text-3xl font-bold text-yellow-400 mt-2">
    Merge Rock AI
  </h1>
  <p className="text-sm text-slate-400 mt-1">
    Rock Animal Merge Event Helper & AI Solver
  </p>
</div>
      <Board
  board={state.board}
  bestMove={solverResult?.bestMove}
  onCellEdit={(row, col, value) => {
    const newBoard =
      state.board.map((r) => [...r]);

    newBoard[row][col] = value as any;

    setState((prev) => ({
      ...prev,
      board: newBoard,
    }));
  }}
/>
<div className="flex flex-col items-center gap-2">

  <button
    onClick={() => performMove("UP")}
    disabled={!hasValidMove}
    className={`${
 
      solverResult &&
solverResult.rankings.length > 0 &&
solverResult.bestMove === "UP"
    ? "bg-green-600 ring-2 ring-green-300 scale-105"
    : "bg-slate-700 hover:bg-slate-600"
} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    ⬆ UP
  </button>

  <div className="flex gap-2">
    <button
      onClick={() => performMove("LEFT")}
      disabled={!hasValidMove}
      className={`${
  solverResult &&
  solverResult.rankings.length > 0 &&
  solverResult.bestMove === "LEFT"
    ? "bg-green-600 ring-2 ring-green-300 scale-105"
    : "bg-slate-700 hover:bg-slate-600"
} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      ⬅ LEFT
    </button>

    <button
      onClick={() => performMove("RIGHT")}
      disabled={!hasValidMove}
      className={`${
  solverResult &&
  solverResult.rankings.length > 0 &&
  solverResult.bestMove === "RIGHT"
    ? "bg-green-600 ring-2 ring-green-300 scale-105"
    : "bg-slate-700 hover:bg-slate-600"
} text-white px-4 py-3 rounded-lg font-semibold transition-all  disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      ➡ RIGHT
    </button>
  </div>

  <button
    onClick={() => performMove("DOWN")}
    disabled={!hasValidMove}
    className={`${
      
  solverResult &&
  solverResult.rankings.length > 0 &&
  solverResult.bestMove === "DOWN"
    ? "bg-green-600 ring-2 ring-green-300 scale-105"
    : "bg-slate-700 hover:bg-slate-600"
} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}

  >
    ⬇ DOWN
  </button>

</div>
<div className="flex justify-center gap-4 mt-3">
  <button
    onClick={handleUndo}
    disabled={state.history.length === 0}
    className="
      bg-slate-700
      hover:bg-slate-600
      disabled:opacity-50
      disabled:cursor-not-allowed
      text-white
      w-24
      py-3
      rounded-lg
      font-semibold
      shadow-lg
      transition
    "
  >
    ↶ Undo
  </button>
  <button
  onClick={handleClearBoard}
  className="bg-red-700 hover:bg-red-600 text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition"
>
  🧹 Clear
</button>
  
</div>
      {solverResult && (
        <MoveRanking result={solverResult} onMoveClick={performMove} />
      )}
      <DangerMeter level={solverResult?.dangerLevel || "SAFE"} />
      {error && (
        <div className="bg-red-900/80 text-red-200 px-4 py-2 rounded-lg text-sm max-w-xs w-full text-center">
          {error}
        </div>
      )}
    </main>
  );
}