"use client";

import { useState } from "react";
import { Board as BoardType, TILE_COLORS } from "@/types";

interface BoardProps {
  board: BoardType;
  bestMove?: string;
  onCellEdit?: (
    row: number,
    col: number,
    value: number
  ) => void;
}

export function Board({
  board,
  bestMove,
  onCellEdit,
}: BoardProps) {
  const [editing, setEditing] =
    useState<{
      row: number;
      col: number;
    } | null>(null);
  return (
    <div className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-slate-800 shadow-inner w-full max-w-xs mx-auto">
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
              className={`aspect-square flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-200 ${
                TILE_COLORS[cell]
              } ${cell === 0 ? "bg-slate-700/50" : "shadow-md"} ${
                isHighlighted && cell !== 0 ? "ring-2 ring-yellow-400 scale-105" : ""
              }`}
           onClick={() =>
  setEditing({
    row: r,
    col: c,
  })
}
>
  {editing?.row === r &&
  editing?.col === c ? (
    <input
  autoFocus
  type="number"
  min={1}
  max={10}
      defaultValue={
        cell === 0 ? "" : cell
      }
      className="w-full h-full text-center bg-transparent outline-none"
      onBlur={(e) => {
     const text =
  e.target.value.trim();

const value =
  text === ""
    ? 0
    : Math.min(
        10,
        Math.max(
          1,
          Number(text)
        )
      );

        onCellEdit?.(
          r,
          c,
          value
        );

        setEditing(null);
      }}
      onKeyDown={(e) => {
        if (
          e.key === "Enter"
        ) {
       const text =
  (
    e.target as HTMLInputElement
  ).value.trim();

const value =
  text === ""
    ? 0
    : Math.min(
        10,
        Math.max(
          1,
          Number(text)
        )
      );

          onCellEdit?.(
            r,
            c,
            value
          );

          setEditing(null);
        }

        if (
          e.key === "Escape"
        ) {
          setEditing(null);
        }
      }}
    />
) : cell !== 0 ? (
<div className="relative flex items-center justify-center h-full">
  <img
    src={`/img/animals/${cell}.png`}
    alt={`Level ${cell}`}
    className="w-12 h-12 object-contain"
  />

 <div
  className="
    absolute
    bottom-1
    left-1/2
    -translate-x-1/2
    bg-slate-900
    border
    border-slate-600
    text-white
    text-[10px]
    font-bold
    rounded-full
    w-5
    h-5
    flex
    items-center
    justify-center
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
  );
}