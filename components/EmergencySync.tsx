"use client";

import { useState } from "react";

interface EmergencySyncProps {
  onSync: (boardString: string) => void;
}

export function EmergencySync({ onSync }: EmergencySyncProps) {
  const [input, setInput] = useState("");

  const handleSync = () => {
    if (input.trim()) onSync(input.trim());
    setInput("");
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg w-full max-w-xs mx-auto space-y-3">
      <h3 className="text-white font-semibold text-sm">Emergency Sync</h3>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`3 5 3 1\n1 7 4 2\n3 4 6 5\n1 2 5 3`}
        className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSync}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition-colors"
      >
        Sync Board
      </button>
    </div>
  );
}