"use client";

import { DangerLevel } from "@/types";

interface DangerMeterProps {
  level: DangerLevel;
}

const config: Record<DangerLevel, { color: string; label: string }> = {
  SAFE: { color: "bg-green-500", label: "Safe" },
  MEDIUM: { color: "bg-yellow-500", label: "Medium" },
  HIGH_RISK: { color: "bg-orange-500", label: "High Risk" },
  CRITICAL: { color: "bg-red-500", label: "Critical" },
};

export function DangerMeter({ level }: DangerMeterProps) {
  const { color, label } = config[level];

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between text-white mb-2">
        <span className="text-sm font-semibold">Danger</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${color}`}>
          {label}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{
            width:
              level === "SAFE"
                ? "25%"
                : level === "MEDIUM"
                ? "50%"
                : level === "HIGH_RISK"
                ? "75%"
                : "100%",
          }}
        />
      </div>
    </div>
  );
}