"use client";

import { useState } from "react";
import { Board as BoardType, TILE_COLORS } from "@/types";

interface BoardProps {
  board: BoardType;
  bestMove?: string;
  onCellEdit?: (row: number, col: number, value: number) => void;
}

export function Board({ board, bestMove, onCellEdit }: BoardProps) {
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null);

  return (
    // 🌟 تصميم الأوبسيديان الفخم (إطار خارجي ناعم ومتدرج)
    <div className="relative p-1 rounded-[1.5rem] bg-gradient-to-b from-slate-600 via-slate-800 to-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-[350px] mx-auto mt-2">
      
      {/* ⬛ لوحة اللعب الداخلية */}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-900 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] border border-slate-950/80 relative overflow-hidden">
        
        {/* إضاءة خلفية خافتة جداً لعمق اللوحة */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>

        {board.map((row, r) =>
          row.map((cell, c) => {
            const isHighlighted =
              bestMove &&
              ((bestMove === "LEFT" && c === 0) ||
                (bestMove === "RIGHT" && c === 3) ||
                (bestMove === "UP" && r === 0) ||
                (bestMove === "DOWN" && r === 3));
            return (
              <div
                key={`${r}-${c}`}
                className={`relative aspect-square flex items-center justify-center rounded-xl font-bold text-xl transition-all duration-300 ${
                  TILE_COLORS[cell]
                } ${
                  cell === 0 
                    ? "bg-slate-950 border border-slate-800/40 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]" // تجويف للمربعات الفاضية
                    : "shadow-[0_4px_10px_rgba(0,0,0,0.4)] border border-white/5" // بروز للمربعات المليانة
                } ${
                  isHighlighted && cell !== 0 ? "ring-2 ring-yellow-400/80 scale-105 z-10 shadow-[0_0_20px_rgba(250,204,21,0.3)]" : ""
                }`}
                onClick={() => setEditing({ row: r, col: c })}
              >
                {editing?.row === r && editing?.col === c ? (
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    max={11}
                    defaultValue={cell === 0 ? "" : cell}
                    className="w-full h-full text-center bg-transparent outline-none text-white font-bold text-2xl"
                    onBlur={(e) => {
                      const text = e.target.value.trim();
                      const value = text === "" ? 0 : Math.min(11, Math.max(1, Number(text)));
                      onCellEdit?.(r, c, value);
                      setEditing(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const text = (e.target as HTMLInputElement).value.trim();
                        const value = text === "" ? 0 : Math.min(11, Math.max(1, Number(text)));
                        onCellEdit?.(r, c, value);
                        setEditing(null);
                      }
                      if (e.key === "Escape") {
                        setEditing(null);
                      }
                    }}
                  />
                ) : cell !== 0 ? (
                  <div className="relative flex items-center justify-center h-full w-full">
                    <img
                      src={`/img/animals/${cell}.png`}
                      alt={`Level ${cell}`}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-xl"
                    />
                    <div
                      className="
                        absolute
                        -bottom-1.5
                        left-1/2
                        -translate-x-1/2
                        bg-slate-900
                        border-2
                        border-slate-700
                        text-slate-200
                        text-[10px]
                        font-black
                        rounded-full
                        min-w-[22px]
                        h-[22px]
                        px-1
                        flex
                        items-center
                        justify-center
                        shadow-[0_2px_4px_rgba(0,0,0,0.6)]
                      "
                    >
                      {cell}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}