"use client";

import { HistoryEntry } from "@/types";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onUndo: () => void;
  canUndo: boolean;
}

export function HistoryPanel({ history, onUndo, canUndo }: HistoryPanelProps) {
  const recent = history.slice(-10).reverse();

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg w-full max-w-xs mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">History</h3>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded disabled:opacity-50"
        >
          Undo
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
        {recent.length === 0 && (
          <p className="text-slate-400 text-xs">No actions yet.</p>
        )}
        {recent.map((entry, idx) => (
          <div key={idx} className="text-slate-300 text-xs flex justify-between">
            <span>{entry.type.replace("_", " ")}</span>
            {entry.tileAdded && (
              <span className="text-slate-400">
                +{entry.tileAdded.value} at ({entry.tileAdded.row},{entry.tileAdded.col})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}