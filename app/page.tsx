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

    if (isGameOver(state.board)) {
      setShowGameOver(true);
    } else {
      setShowGameOver(false); 
    }

    const has11 = state.board.some(row => row.includes(11));
    const seenLegendary = localStorage.getItem("seen-legendary") === "true";

    if (has11 && !seenLegendary) {
      setShowLegendary(true);
      localStorage.setItem("seen-legendary", "true"); 
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
    localStorage.removeItem("seen-legendary"); 
  }, []);

  const hasValidMove = solverResult && solverResult.rankings.length > 0 && !isThinking;

  // تصميم موحد للأزرار المجسمة 3D
  const DirectionButton = ({ dir, label, active }: { dir: "UP" | "DOWN" | "LEFT" | "RIGHT", label: string, active: boolean }) => (
    <button
      onClick={() => performMove(dir)}
      disabled={!hasValidMove}
      className={`relative overflow-hidden font-bold text-white w-24 py-3 rounded-xl border border-slate-900 shadow-[0_8px_15px_rgba(0,0,0,0.6)] transition-all duration-200 flex items-center justify-center
        ${active 
          ? "bg-gradient-to-b from-green-400 to-green-700 ring-2 ring-green-400/60 shadow-[0_0_25px_rgba(34,197,94,0.5)] scale-110 z-10" 
          : "bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 active:scale-95 active:shadow-none translate-y-0 active:translate-y-1"}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-xl" />
      <span className="relative z-10 drop-shadow-md">{label}</span>
    </button>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex flex-col items-center relative overflow-hidden">
      
      {/* 🌟 Pop-up الحيوان الأسطوري 🌟 */}
      {showLegendary && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-1 rounded-2xl shadow-2xl animate-bounce">
            <div className="bg-slate-900 p-8 rounded-xl text-center space-y-4 max-w-sm border border-slate-700">
              <h2 className="text-3xl font-bold text-yellow-400">🌟 أسطوووورة! 🌟</h2>
              <p className="text-white text-lg">عاش جداً! قدرت تدمج 10+10 وتوصل للحيوان الأسطوري (مستوى 11).</p>
              <button
                onClick={() => setShowLegendary(false)}
                className="w-full mt-4 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-slate-900 font-bold py-3 px-6 rounded-lg transition shadow-[0_5px_15px_rgba(234,179,8,0.4)]"
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
          <div className="bg-gradient-to-br from-red-600 to-slate-900 p-1 rounded-2xl shadow-2xl">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl text-center space-y-5 max-w-sm">
              <h2 className="text-4xl font-bold text-red-500 drop-shadow-md">Game Over</h2>
              <p className="text-slate-300 text-lg">البورد اتقفلت ومفيش أي حركة ممكنة.. متزعلش، جرب تاني وظبط تكتيكك!</p>
              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={() => { handleUndo(); setShowGameOver(false); }}
                  disabled={state.history.length === 0}
                  className="w-full relative overflow-hidden bg-gradient-to-b from-slate-600 to-slate-800 text-white font-bold py-3 px-4 rounded-lg transition active:scale-95 disabled:opacity-50 border border-slate-900 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  ↶ تراجع خطوة (Undo)
                </button>
                <button
                  onClick={() => { handleClearBoard(); setShowGameOver(false); }}
                  className="w-full relative overflow-hidden bg-gradient-to-b from-red-500 to-red-800 hover:from-red-400 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition active:scale-95 border border-slate-900 shadow-[0_5px_15px_rgba(220,38,38,0.4)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  🧹 ابدأ جيم جديد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ Header Section ✨ */}
      <header className="flex flex-col items-center justify-center w-full mb-3 mt-2">
        {/* Logo Container - يحافظ على الأبعاد الأصلية وبدون اقتصاص */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:scale-105 transition-transform duration-300">
          <img 
            src="/img/logo.jpg" 
            alt="App Logo" 
            className="w-full h-full object-contain rounded-2xl z-10"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide mt-1">
          Merge Rock AI
        </h1>
        
        {/* Subtitle */}
        <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1.5 tracking-[0.2em] uppercase">
          Expectimax Engine Active
        </p>

        {/* AI Thinking Indicator */}
        {isThinking && (
          <div className="mt-3 px-4 py-1.5 bg-blue-900/40 border border-blue-500/30 rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">AI is calculating...</p>
          </div>
        )}
      </header>

      {/* اللوحة الرئيسية */}
      <Board
        board={state.board}
        bestMove={solverResult?.bestMove}
        onCellEdit={(row, col, value) => {
          const newBoard = state.board.map((r) => [...r]);
          newBoard[row][col] = value as any;
          setState((prev) => ({ ...prev, board: newBoard }));
        }}
      />

      {/* 🎮 وحدة التحكم (Controller Console) 🎮 */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-4 rounded-[2rem] shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5)] border border-slate-700/50 flex flex-col items-center gap-3 mt-4">
        <DirectionButton dir="UP" label="⬆ UP" active={solverResult?.bestMove === "UP"} />
        <div className="flex gap-4">
          <DirectionButton dir="LEFT" label="⬅ LEFT" active={solverResult?.bestMove === "LEFT"} />
          <DirectionButton dir="RIGHT" label="➡ RIGHT" active={solverResult?.bestMove === "RIGHT"} />
        </div>
        <DirectionButton dir="DOWN" label="⬇ DOWN" active={solverResult?.bestMove === "DOWN"} />
      </div>

      {/* 🛠 الأزرار السفلية (Bottom Actions) 🛠 */}
      <div className="flex justify-center gap-5 mt-4 mb-6">
        <button 
          onClick={handleUndo} 
          disabled={state.history.length === 0 || isThinking} 
          className="relative overflow-hidden bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white w-28 py-3 rounded-xl font-bold border border-slate-900 shadow-[0_8px_15px_rgba(0,0,0,0.5)] transition-all flex justify-center items-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <span className="relative z-10 drop-shadow-md">↶ Undo</span>
        </button>
        
        <button 
          onClick={handleClearBoard} 
          disabled={isThinking} 
          className="relative overflow-hidden bg-gradient-to-b from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 active:scale-95 disabled:opacity-50 text-white w-28 py-3 rounded-xl font-bold border border-slate-900 shadow-[0_8px_15px_rgba(153,27,27,0.4)] transition-all flex justify-center items-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <span className="relative z-10 drop-shadow-md">🧹 Clear</span>
        </button>
      </div>

      {/* 👑 Footer Section 👑 */}
      <footer className="mt-auto pt-6 pb-2 w-full text-center">
        <div className="inline-block relative">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
          <p className="text-slate-400 text-xs sm:text-sm font-medium pt-3">
            Developed & Engineered by
          </p>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 font-black text-sm sm:text-base tracking-widest uppercase mt-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Mahmoud R. eLSHEIKH
          </p>
        </div>
      </footer>

    </main>
  );
}