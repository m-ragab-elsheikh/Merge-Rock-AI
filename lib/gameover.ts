import { Board, TileValue } from "@/types";

export function isGameOver(board: Board): boolean {
  // هل اللوحة ممتلئة بالكامل؟
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
    }
  }

  // التحقق من وجود أي دمج ممكن أفقياً
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (canMerge(board[r][c], board[r][c + 1])) return false;
    }
  }

  // التحقق من وجود أي دمج ممكن رأسياً
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (canMerge(board[r][c], board[r + 1][c])) return false;
    }
  }

  return true;
}

function canMerge(a: TileValue, b: TileValue): boolean {
  if (a === 0 || b === 0) return false;
  if (a === 11 || b === 11) return false; // تم الوصول للحد الأقصى (المستوى 11 لا يدمج مع شيء آخر)
  return a === b; // يدمج فقط إذا كانت المستويات متطابقة (مثل 10 مع 10 لتصبح 11)
}