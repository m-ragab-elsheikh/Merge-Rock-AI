"use client";

import { useState, useEffect, useCallback } from "react";
import { Board } from "@/components/Board";
import { MoveRanking } from "@/components/MoveRanking";
import { DangerMeter } from "@/components/DangerMeter";
import { EmergencySync } from "@/components/EmergencySync";
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
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
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

  const handleSync = useCallback(
    (input: string) => {
      const { board, error: parseError } = parseBoardFromString(input);
      if (parseError) {
        setError(parseError);
        return;
      }
      // Clear history and set board
      setState({ board, history: [] });
      setError("");
    },
    [setState]
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <h1 className="text-3xl font-bold text-white">Merge Solver AI</h1>
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
    className="bg-slate-700 hover:bg-slate-600 text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition"
  >
    ⬆ UP
  </button>

  <div className="flex gap-2">
    <button
      onClick={() => performMove("LEFT")}
      className="bg-slate-700 hover:bg-slate-600 text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition"
    >
      ⬅ LEFT
    </button>

    <button
      onClick={() => performMove("RIGHT")}
      className="bg-slate-700 hover:bg-slate-600 text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition"
    >
      ➡ RIGHT
    </button>
  </div>

  <button
    onClick={() => performMove("DOWN")}
    className="bg-slate-700 hover:bg-slate-600 text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition"
  >
    ⬇ DOWN
  </button>

</div>
<div className="flex justify-center mt-3">
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
</div>
  
      {solverResult && (
        <MoveRanking result={solverResult} onMoveClick={performMove} />
      )}
      <DangerMeter level={solverResult?.dangerLevel || "SAFE"} />
      <EmergencySync onSync={handleSync} />
      {error && (
        <div className="bg-red-900/80 text-red-200 px-4 py-2 rounded-lg text-sm max-w-xs w-full text-center">
          {error}
        </div>
      )}
    </main>
  );
}