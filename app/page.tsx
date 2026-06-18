"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Board } from "@/components/Board";
import { GameState, SolverResult } from "@/types";
import { initialState, addMoveToHistory, undoLast } from "@/lib/history";
import { applyMove } from "@/lib/merge";
import { isGameOver } from "@/lib/gameover";

const STORAGE_KEY = "merge-solver-ai-state";

export default function HomePage() {
  const [state, setState] = useState<GameState>(initialState());
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [error, setError] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  
  // حالات الـ Pop-ups
  const [showLegendary, setShowLegendary] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  
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

  // مراقبة أحداث اللعبة (الخسارة أو الفوز بـ 11)
  useEffect(() => {
    if (!state.board) return;

    // 1. فحص الـ Game Over
    if (isGameOver(state.board)) {
      setShowGameOver(true);
    } else {
      setShowGameOver(false); // إخفاء الرسالة لو المستخدم عمل تراجع (Undo)
    }

    // 2. فحص ظهور الحيوان الأسطوري (11) لأول مرة
    const has11 = state.board.some(row => row.includes(11));
    const seenLegendary = localStorage.getItem("seen-legendary") === "true";

    if (has11 && !seenLegendary) {
      setShowLegendary(true);
      localStorage.setItem("seen-legendary", "true"); // حفظ عشان متظهرش تاني
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
    localStorage.removeItem("seen-legendary"); // تصفير الإنجاز في الجيم الجديد
  }, []);

  const hasValidMove = solverResult && solverResult.rankings.length > 0 && !isThinking;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex flex-col items-center gap-6 relative">
      
      {/* 🌟 Pop-up الحيوان الأسطوري 🌟 */}
      {showLegendary && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-1 rounded-2xl shadow-2xl animate-bounce">
            <div className="bg-slate-900 p-8 rounded-xl text-center space-y-4 max-w-sm">
              <h2 className="text-3xl font-bold text-yellow-400">🌟 أسطوووورة! 🌟</h2>
              <p className="text-white text-lg">عاش جداً! قدرت تدمج 10+10 وتوصل للحيوان الأسطوري (مستوى 11).</p>
              <button
                onClick={() => setShowLegendary(false)}
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg transition shadow-lg"
              >
                كمل عظمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💀 Pop-up الجيم أوفر 💀 */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-red-500 p-8 rounded-2xl shadow-2xl text-center space-y-5 max-w-sm">
            <h2 className="text-4xl font-bold text-red-500 drop-shadow-md">Game Over</h2>
            <p className="text-slate-300 text-lg">البورد اتقفلت ومفيش أي حركة ممكنة.. متزعلش، جرب تاني وظبط تكتيكك!</p>
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  handleUndo();
                  setShowGameOver(false);
                }}
                disabled={state.history.length === 0}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                ↶ تراجع خطوة (Undo)
              </button>
              <button
                onClick={() => {
                  handleClearBoard();
                  setShowGameOver(false);
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg"
              >
                🧹 ابدأ جيم جديد
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-2">
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