const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { addToQueue, handleDisconnect, endGame, getRoomForSocket, getGame } = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('find-game', () => {
    addToQueue(socket, io);
  });

  socket.on('make-move', (index) => {
    const roomId = getRoomForSocket(socket.id);
    if (!roomId) {
      return;
    }

    const room = getGame(roomId);
    if (!room) {
      return;
    }

    const { game, players } = room;
    const playerSymbol = players.X === socket ? 'X' : 'O';
    if (playerSymbol !== game.currentPlayer) {
      return;
    }

    const result = game.makeMove(index);
    if (!result.valid) {
      return;
    }

    io.to(roomId).emit('move-made', {
      index,
      symbol: result.symbol,
      board: result.board,
    });

    if (result.winner || result.isDraw) {
      io.to(roomId).emit('game-over', {
        winner: result.winner,
        isDraw: result.isDraw,
        board: result.board,
      });
      endGame(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleDisconnect(socket, io);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
