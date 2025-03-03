export function computerMove(board: string[]) {
    const available = board.map((val, i) => (val === null ? i : null)).filter((v) => v !== null);
    return available[Math.floor(Math.random() * available.length)];
  }