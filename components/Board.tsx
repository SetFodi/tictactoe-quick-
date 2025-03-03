"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { calculateWinner } from "../utils/gameLogic";
import { computerMove } from "../utils/aiLogic";

interface BoardProps {
  mode: "single" | "multi";
  room?: string;
}

export default function Board({ mode, room }: BoardProps) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // X is always the player, O is computer in single mode
  const [socket, setSocket] = useState(null);
  const winner = calculateWinner(board);

  // Handle multiplayer socket connection
  useEffect(() => {
    if (mode === "multi") {
      const newSocket = io("http://localhost:3000", { path: "/api/socket" });
      setSocket(newSocket);
      newSocket.emit("join-game", room);

      newSocket.on("opponent-move", ({ index, player }) => {
        const newBoard = [...board];
        newBoard[index] = player;
        setBoard(newBoard);
        setIsXNext(!isXNext);
      });

      return () => newSocket.disconnect();
    }
  }, [mode, room, board]);

  // Handle computer move after player's turn in single mode
  useEffect(() => {
    if (mode === "single" && !isXNext && !winner) {
      const newBoard = [...board];
      const aiIndex = computerMove(newBoard);
      newBoard[aiIndex] = "O";
      setTimeout(() => {
        setBoard(newBoard);
        setIsXNext(true); // Back to player's turn
      }, 500); // Slight delay for a smoother feel
    }
  }, [mode, isXNext, board, winner]);

  const handleClick = (index: number) => {
    if (board[index] || winner) return; // Prevent move if square is taken or game is over

    if (mode === "single" && !isXNext) return; // Prevent player from moving as "O" in single mode

    const newBoard = [...board];
    if (mode === "single") {
      // Player is always "X" in single mode
      newBoard[index] = "X";
      setBoard(newBoard);
      setIsXNext(false); // Trigger computer's turn
    } else if (mode === "multi" && socket) {
      // Multiplayer mode: allow alternating X and O
      newBoard[index] = isXNext ? "X" : "O";
      setBoard(newBoard);
      setIsXNext(!isXNext);
      socket.emit("move", { room, index, player: isXNext ? "X" : "O" });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-96 relative">
      {board.map((square, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className="w-24 h-24 bg-gray-100 rounded-lg text-4xl font-bold flex items-center justify-center hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
        >
          {square}
        </button>
      ))}
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-5xl text-white font-bold animate-bounce">
            {winner} Wins!
          </p>
        </div>
      )}
    </div>
  );
}