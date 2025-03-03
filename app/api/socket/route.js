import { Server } from "socket.io";

let io;

export async function GET(req) {
  const res = new Response("Socket.io server running", { status: 200 });

  if (!req.socket.server.io) {
    const io = new Server(req.socket.server, {
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("join-game", (room) => {
        socket.join(room);
        socket.to(room).emit("player-joined", socket.id);
      });

      socket.on("move", ({ room, index, player }) => {
        socket.to(room).emit("opponent-move", { index, player });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    req.socket.server.io = io;
  }

  return res;
}

export const config = {
  api: {
    bodyParser: false,
  },
};