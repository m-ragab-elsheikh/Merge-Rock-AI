import { Board, HistoryEntry, GameState, TileValue, ActionType } from "@/types";
import { applyMove } from "./merge";

export function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0 as TileValue)) as Board;
}

export function initialState(): GameState {
  return {
    board: createEmptyBoard(),
    history: [],
  };
}

export function addMoveToHistory(
  state: GameState,
  action: ActionType,
  newBoard: Board,
  tileAdded?: { value: TileValue; row: number; col: number }
): GameState {
  const entry: HistoryEntry = {
    type: action,
    boardBefore: state.board,
    boardAfter: newBoard,
    tileAdded,
  };
  return {
    board: newBoard,
    history: [...state.history, entry],
  };
}

export function undoLast(state: GameState): GameState | null {
  if (state.history.length === 0) return null;
  const previous = state.history[state.history.length - 1];
  return {
    board: previous.boardBefore,
    history: state.history.slice(0, -1),
  };
}