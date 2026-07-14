const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

class TicTacToeGame {
  constructor() {
    this.board = new Array(9).fill(null);
    this.currentPlayer = 'X';
    this.finished = false;
  }

  makeMove(cellIndex) {
    const isValid =
      !this.finished &&
      Number.isInteger(cellIndex) &&
      cellIndex >= 0 &&
      cellIndex <= 8 &&
      this.board[cellIndex] === null;

    if (!isValid) {
      return {
        valid: false,
        symbol: null,
        winner: this.getWinner(),
        isDraw: this.isBoardFull(),
        board: this.board,
      };
    }

    const symbol = this.currentPlayer;
    this.board[cellIndex] = symbol;

    const winner = this.getWinner();
    const isDraw = !winner && this.isBoardFull();

    if (winner || isDraw) {
      this.finished = true;
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    return {
      valid: true,
      symbol,
      winner,
      isDraw,
      board: this.board,
    };
  }

  getState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
    };
  }

  getWinner() {
    for (const [a, b, c] of WINNING_LINES) {
      if (
        this.board[a] !== null &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return this.board[a];
      }
    }
    return null;
  }

  isBoardFull() {
    return this.board.every((cell) => cell !== null);
  }
}

module.exports = TicTacToeGame;
