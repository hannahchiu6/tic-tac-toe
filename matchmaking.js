const crypto = require('crypto');
const TicTacToeGame = require('./game');

const waitingQueue = [];
const activeGames = new Map(); // roomId -> { game, players: { X: socket, O: socket } }
const socketRooms = new Map(); // socketId -> roomId

function addToQueue(socket, io) {
  if (waitingQueue.includes(socket) || socketRooms.has(socket.id)) {
    return;
  }

  const opponent = waitingQueue.shift();

  if (!opponent) {
    waitingQueue.push(socket);
    socket.emit('waiting');
    return;
  }

  const roomId = crypto.randomUUID();
  const game = new TicTacToeGame();

  const firstIsX = Math.random() < 0.5;
  const [xSocket, oSocket] = firstIsX ? [opponent, socket] : [socket, opponent];

  activeGames.set(roomId, {
    game,
    players: { X: xSocket, O: oSocket },
  });

  socketRooms.set(xSocket.id, roomId);
  socketRooms.set(oSocket.id, roomId);

  xSocket.join(roomId);
  oSocket.join(roomId);

  xSocket.emit('game-start', { symbol: 'X', roomId });
  oSocket.emit('game-start', { symbol: 'O', roomId });
}

function removeFromQueue(socket) {
  const index = waitingQueue.indexOf(socket);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
  }
}

function endGame(roomId) {
  const room = activeGames.get(roomId);
  if (!room) {
    return;
  }

  const { players } = room;
  [players.X, players.O].forEach((playerSocket) => {
    if (playerSocket) {
      socketRooms.delete(playerSocket.id);
      playerSocket.leave(roomId);
    }
  });

  activeGames.delete(roomId);
}

function handleDisconnect(socket, io) {
  removeFromQueue(socket);

  const roomId = socketRooms.get(socket.id);
  if (!roomId) {
    return;
  }

  const room = activeGames.get(roomId);
  if (room) {
    const { players } = room;
    const opponent = players.X === socket ? players.O : players.X;
    if (opponent) {
      opponent.emit('opponent-left');
    }
  }

  endGame(roomId);
}

function getRoomForSocket(socketId) {
  return socketRooms.get(socketId);
}

function getGame(roomId) {
  return activeGames.get(roomId);
}

module.exports = {
  addToQueue,
  removeFromQueue,
  handleDisconnect,
  endGame,
  getRoomForSocket,
  getGame,
};
