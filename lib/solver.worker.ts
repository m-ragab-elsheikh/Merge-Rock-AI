import { getBestMove } from "./solver";

self.onmessage = (e: MessageEvent) => {
  const { board } = e.data;
  const result = getBestMove(board);
  self.postMessage(result);
};