"use client";

import { useState } from "react";
import { TileValue } from "@/types";

interface TileInputProps {
  onAddTile: (value: TileValue, row: number, col: number) => void;
  disabled?: boolean;
}

export function TileInput({ onAddTile, disabled }: TileInputProps) {
  const [value, setValue] = useState<number>(1);
  const [row, setRow] = useState<number>(1);
  const [col, setCol] = useState<number>(1);
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (value < 1 || value > 11) {
      setError("Value must be 1-11");
      return;
    }
    if (row < 1 || row > 4 || col < 1 || col > 4) {
      setError("Row/Col must be 1-4");
      return;
    }
    onAddTile(value as TileValue, row, col);
    setError("");
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg space-y-3 w-full max-w-xs mx-auto">
      <h3 className="text-white font-semibold text-sm">Add Tile</h3>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Value</label>
          <input
            type="number"
            min={1}
            max={11}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full bg-slate-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Row</label>
          <input
            type="number"
            min={1}
            max={4}
            value={row}
            onChange={(e) => setRow(Number(e.target.value))}
            className="w-full bg-slate-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Col</label>
          <input
            type="number"
            min={1}
            max={4}
            value={col}
            onChange={(e) => setCol(Number(e.target.value))}
            className="w-full bg-slate-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
        </div>
      </div>
      <button
        onClick={handleAdd}
        disabled={disabled}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        Add Tile
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}