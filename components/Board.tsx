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
  const [isXNext, setIsXNext] = useState(true);
  const [playerSymbol, setPlayerSymbol] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  // Multiplayer setup
  useEffect(() => {
    if (mode !== "multi" || !room) return;

    const newSocket = io("http://localhost:3000", { path: "/api/socket" });
    setSocket(newSocket);

    newSocket.emit("join-game", room);

    newSocket.on("assign-symbol", (symbol) => {
      console.log(`Assigned symbol: ${symbol}`);
      setPlayerSymbol(symbol);
    });

    newSocket.on("opponent-move", ({ index, player }) => {
      console.log(`Received opponent move: index=${index}, player=${player}`);
      setBoard((prevBoard) => {
        if (prevBoard[index]) return prevBoard; // Skip if already set
        const newBoard = [...prevBoard];
        newBoard[index] = player;
        console.log(`Updated board: ${newBoard}`);
        return newBoard;
      });
      setIsXNext((prev) => (player === "X" ? false : true));
    });

    newSocket.on("reset-game", () => {
      console.log("Resetting game");
      setBoard(Array(9).fill(null));
      setIsXNext(true);
    });

    return () => newSocket.disconnect();
  }, [mode, room]);

  // Request symbol on join
  useEffect(() => {
    if (mode === "multi" && socket && playerSymbol === null) {
      socket.emit("request-symbol", room);
    }
  }, [mode, socket, room, playerSymbol]);

  // Single-player computer move
  useEffect(() => {
    if (mode === "single" && !isXNext && !winner && !isDraw) {
      const newBoard = [...board];
      const aiIndex = computerMove(newBoard);
      newBoard[aiIndex] = "O";
      console.log(`Computer move: index=${aiIndex}, board=${newBoard}`);
      setTimeout(() => {
        setBoard(newBoard);
        setIsXNext(true);
      }, 500);
    }
  }, [mode, isXNext, board, winner, isDraw]);

  const handleClick = (index: number) => {
    if (board[index] || winner || isDraw || !playerSymbol) return;

    if (mode === "single") {
      if (!isXNext) return;
      const newBoard = [...board];
      newBoard[index] = "X";
      console.log(`Player move (single): index=${index}, board=${newBoard}`);
      setBoard(newBoard);
      setIsXNext(false);
    } else if (mode === "multi" && socket) {
      const isPlayerTurn = (playerSymbol === "X" && isXNext) || (playerSymbol === "O" && !isXNext);
      if (!isPlayerTurn) return;

      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      console.log(`Player move (multi): index=${index}, player=${playerSymbol}, board=${newBoard}`);
      setBoard(newBoard);
      setIsXNext(!isXNext);
      socket.emit("move", { room, index, player: playerSymbol });
    }
  };

  const resetGame = () => {
    console.log("Reset initiated");
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    if (mode === "multi" && socket) {
      socket.emit("reset-game", room);
    }
  };

  const getGameStatus = () => {
    if (winner) {
      return playerSymbol === winner ? "You Win!" : "You Lose!";
    }
    if (isDraw) return "Draw!";
    return `${isXNext ? "X" : "O"}'s Turn`;
  };

  return (
    <div className="text-center">
      <p className="text-2xl text-white mb-4">
        {mode === "single" ? "Vs Computer" : `Room: ${room} | You are ${playerSymbol || "Waiting..."}`}
      </p>
      <div className="grid grid-cols-3 gap-2 w-96 relative mx-auto">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-24 h-24 bg-gray-100 rounded-lg text-4xl font-bold flex items-center justify-center hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
          >
            {square}
          </button>
        ))}
      </div>
      {(winner || isDraw) && (
        <div className="mt-6">
          <p className="text-4xl text-white font-bold animate-bounce">{getGameStatus()}</p>
          <button
            onClick={resetGame}
            className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}