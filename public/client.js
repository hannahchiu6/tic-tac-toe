const socket = io();

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

const findGameBtn = document.getElementById('find-game-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const statusEl = document.getElementById('status');
const cells = Array.from(document.querySelectorAll('.cell'));

let mySymbol = null;
let roomId = null;
let currentTurn = 'X';
let board = new Array(9).fill(null);
let gameActive = false;

function setStatus(text) {
  statusEl.textContent = text;
  statusEl.classList.remove('pulse');
}

function cellsEnabled(enabled) {
  cells.forEach((cell, index) => {
    cell.disabled = !enabled || board[index] !== null;
  });
}

function updateTurnStatus() {
  if (currentTurn === mySymbol) {
    setStatus('Your turn');
    statusEl.classList.add('pulse');
  } else {
    setStatus("Opponent's turn");
  }
}

function resetBoard() {
  board = new Array(9).fill(null);
  cells.forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('X', 'O', 'winning-cell');
    cell.disabled = false;
  });
}

function highlightWinningCells(winner) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] === winner && board[b] === winner && board[c] === winner) {
      line.forEach((index) => cells[index].classList.add('winning-cell'));
      return;
    }
  }
}

findGameBtn.addEventListener('click', () => {
  socket.emit('find-game');
  setStatus('Searching for opponent...');
  findGameBtn.disabled = true;
  findGameBtn.classList.add('loading');
});

playAgainBtn.addEventListener('click', () => {
  resetBoard();
  gameActive = false;
  playAgainBtn.disabled = true;
  playAgainBtn.classList.add('loading');
  socket.emit('find-game');
  setStatus('Searching for opponent...');
});

cells.forEach((cell) => {
  cell.addEventListener('click', () => {
    const index = Number(cell.dataset.index);
    if (!gameActive || currentTurn !== mySymbol || board[index] !== null) {
      return;
    }
    socket.emit('make-move', index, roomId);
  });
});

socket.on('waiting', () => {
  setStatus('Waiting for another player...');
});

socket.on('game-start', ({ symbol, roomId: newRoomId }) => {
  mySymbol = symbol;
  roomId = newRoomId;
  currentTurn = 'X';
  gameActive = true;
  resetBoard();
  findGameBtn.classList.remove('loading');
  playAgainBtn.hidden = true;
  playAgainBtn.disabled = false;
  playAgainBtn.classList.remove('loading');
  updateTurnStatus();
  cellsEnabled(currentTurn === mySymbol);
});

socket.on('move-made', ({ index, symbol, board: newBoard }) => {
  board = newBoard;
  cells[index].classList.add(symbol);
  currentTurn = symbol === 'X' ? 'O' : 'X';
  updateTurnStatus();
  cellsEnabled(gameActive && currentTurn === mySymbol);
});

socket.on('game-over', ({ winner, isDraw, board: finalBoard }) => {
  board = finalBoard;
  gameActive = false;
  cellsEnabled(false);

  if (isDraw) {
    setStatus("It's a draw!");
  } else if (winner === mySymbol) {
    setStatus('You win!');
    highlightWinningCells(winner);
  } else {
    setStatus('You lose!');
    highlightWinningCells(winner);
  }

  playAgainBtn.hidden = false;
});

socket.on('opponent-left', () => {
  gameActive = false;
  cellsEnabled(false);
  setStatus('Opponent disconnected');
  playAgainBtn.hidden = false;
});
