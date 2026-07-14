# Tic Tac Toe

A real-time multiplayer tic-tac-toe game built with Socket.io.

## How to Play

1. Click **Find Game** to enter matchmaking — you'll be paired with the next available player.
2. Once matched, take turns placing your symbol (🦋 or 🌼) on the board.
3. First to line up three in a row wins; a full board with no winner is a draw.
4. Click **Play Again** to search for a new opponent.

## Tech Stack

- Node.js
- Express
- Socket.io
- Plain HTML/CSS/JS (no frontend framework)

## Run Locally

```bash
git clone <repo-url>
cd tic-tac-toe
npm install
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. Open it in two tabs (or two devices) to play a full match.

## How It Works

The server (`server.js`) holds the authoritative game state and matchmaking queue; it never trusts the client. Each browser connects over a WebSocket (via Socket.io) and sends events like `find-game` and `make-move`. The server validates every move, updates the board, and broadcasts the result back to both players in the room, so the two clients always stay in sync.
