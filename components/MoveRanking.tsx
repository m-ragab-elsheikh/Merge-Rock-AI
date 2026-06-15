"use client";

import { SolverResult, Direction } from "@/types";

interface MoveRankingProps {
  result: SolverResult | null;
  onMoveClick: (direction: Direction) => void;
}

export function MoveRanking({ result, onMoveClick }: MoveRankingProps) {
  if (!result || result.rankings.length === 0) {
    return (
      <div className="bg-slate-800 p-4 rounded-xl shadow-lg w-full max-w-xs mx-auto text-center text-slate-400">
        No valid moves available
      </div>
    );
  }

const maxScore = Math.max(
  ...result.rankings.map(r => r.score)
);
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg w-full max-w-xs mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">
  Move Analysis
</h3>
      </div>
      <div className="text-xs text-slate-400">
        Confidence: {result.confidence}%
      </div>
      {result.reasons.length > 0 && (
  <div className="bg-slate-700 rounded-lg p-2">
    <div className="text-xs font-semibold text-slate-300 mb-1">
      Reason
    </div>

    <ul className="text-xs text-slate-400 space-y-1">
      {result.reasons.map(
        (reason, index) => (
          <li key={index}>
            • {reason}
          </li>
        )
      )}
    </ul>
  </div>
)}
      <div className="space-y-2">
        {result.rankings.map((mv) => {
  const width =
    (mv.score / maxScore) * 100;

  return (
<div key={mv.direction}>
  <button
    onClick={() => onMoveClick(mv.direction)}
    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      result.rankings.length > 0 &&
mv.direction === result.bestMove
        ? "bg-green-600 text-white"
        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
    }`}
  >
    <span>{mv.direction}</span>
    <span className="font-mono">
      {mv.score.toLocaleString()}
    </span>
  </button>

  <div className="w-full bg-slate-800 rounded h-2 mt-1">
    <div
      className="bg-green-500 h-2 rounded"
      style={{
        width: `${width}%`
      }}
    />
  </div>
</div>
  );
})}
      </div>
    </div>
  );
}