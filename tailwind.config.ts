import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tile: {
          0: "#1e293b",
          1: "#475569",
          2: "#334155",
          3: "#1e40af",
          4: "#1d4ed8",
          5: "#2563eb",
          6: "#3b82f6",
          7: "#60a5fa",
          8: "#93c5fd",
          9: "#bfdbfe",
          10: "#fbbf24",
        },
        danger: {
          safe: "#22c55e",
          medium: "#eab308",
          high: "#f97316",
          critical: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};

export default config;