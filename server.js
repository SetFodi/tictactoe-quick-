const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    path: "/api/socket",
  });

  const rooms = new Map(); // Track players in each room

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-game", (room) => {
      socket.join(room);

      if (!rooms.has(room)) {
        rooms.set(room, []);
      }
      const players = rooms.get(room);
      players.push(socket.id);
      rooms.set(room, players);

      // Notify other players in the room
      socket.to(room).emit("player-joined", socket.id);
    });

    socket.on("request-symbol", (room) => {
      const players = rooms.get(room) || [];
      const playerCount = players.length;

      if (playerCount === 1) {
        socket.emit("assign-symbol", "X"); // First player is "X"
      } else if (playerCount === 2) {
        socket.emit("assign-symbol", "O"); // Second player is "O"
      }
    });

    socket.on("move", ({ room, index, player }) => {
      socket.to(room).emit("opponent-move", { index, player });
    });

    socket.on("reset-game", (room) => {
      socket.to(room).emit("reset-game");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [room, players] of rooms.entries()) {
        const index = players.indexOf(socket.id);
        if (index !== -1) {
          players.splice(index, 1);
          if (players.length === 0) rooms.delete(room);
          else rooms.set(room, players);
          break;
        }
      }
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});