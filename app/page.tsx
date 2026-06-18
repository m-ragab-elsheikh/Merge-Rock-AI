"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Board } from "@/components/Board";
import { GameState, SolverResult } from "@/types";
import { initialState, addMoveToHistory, undoLast } from "@/lib/history";
import { applyMove } from "@/lib/merge";

const STORAGE_KEY = "merge-solver-ai-state";

export default function HomePage() {
  const [state, setState] = useState<GameState>(initialState());
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [error, setError] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL("@/lib/solver.worker.ts", import.meta.url));
    workerRef.current.onmessage = (e: MessageEvent<SolverResult>) => {
      setSolverResult(e.data);
      setIsThinking(false);
    };
    return () => workerRef.current?.terminate();
  }, []);

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

  // Request move calculation from Worker
  useEffect(() => {
    if (state.board && workerRef.current) {
      setIsThinking(true);
      workerRef.current.postMessage({ board: state.board });
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
      const updated = addMoveToHistory(state, `MOVE_${direction}`, newBoard);
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
    setState({ board: emptyBoard, history: [] });
    setError("");
  }, []);

  const hasValidMove = solverResult && solverResult.rankings.length > 0 && !isThinking;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex flex-col items-center gap-6">
      <div className="text-center mb-2">
        <img src="/img/logo.jpg" alt="Merge Rock AI Logo" className="w-16 h-16 mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-yellow-400 mt-2">Merge Rock AI</h1>
        <p className="text-sm text-slate-400 mt-1">Expectimax Engine Active</p>
        {isThinking && <p className="text-sm text-blue-400 mt-2 animate-pulse">AI is thinking...</p>}
      </div>

      <Board
        board={state.board}
        bestMove={solverResult?.bestMove}
        onCellEdit={(row, col, value) => {
          const newBoard = state.board.map((r) => [...r]);
          newBoard[row][col] = value as any;
          setState((prev) => ({ ...prev, board: newBoard }));
        }}
      />

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => performMove("UP")}
          disabled={!hasValidMove}
          className={`${solverResult?.bestMove === "UP" ? "bg-green-600 ring-2 ring-green-300 scale-105" : "bg-slate-700 hover:bg-slate-600"} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          ⬆ UP
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => performMove("LEFT")}
            disabled={!hasValidMove}
            className={`${solverResult?.bestMove === "LEFT" ? "bg-green-600 ring-2 ring-green-300 scale-105" : "bg-slate-700 hover:bg-slate-600"} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            ⬅ LEFT
          </button>
          <button
            onClick={() => performMove("RIGHT")}
            disabled={!hasValidMove}
            className={`${solverResult?.bestMove === "RIGHT" ? "bg-green-600 ring-2 ring-green-300 scale-105" : "bg-slate-700 hover:bg-slate-600"} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            ➡ RIGHT
          </button>
        </div>

        <button
          onClick={() => performMove("DOWN")}
          disabled={!hasValidMove}
          className={`${solverResult?.bestMove === "DOWN" ? "bg-green-600 ring-2 ring-green-300 scale-105" : "bg-slate-700 hover:bg-slate-600"} text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          ⬇ DOWN
        </button>
      </div>

      <div className="flex justify-center gap-4 mt-3">
        <button onClick={handleUndo} disabled={state.history.length === 0 || isThinking} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition">
          ↶ Undo
        </button>
        <button onClick={handleClearBoard} disabled={isThinking} className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white w-24 py-3 rounded-lg font-semibold shadow-lg transition">
          🧹 Clear
        </button>
      </div>
    </main>
  );
}