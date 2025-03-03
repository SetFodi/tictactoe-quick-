"use client"; // Client component since it uses event handlers

import Link from "next/link";

export default function ModeSelector() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Tic-Tac-Toe</h1>
        <Link href="/game?mode=single">
          <button className="block w-full bg-indigo-600 text-white py-3 rounded-lg mb-4 hover:bg-indigo-700 transition-colors">
            Vs Computer
          </button>
        </Link>
        <Link href="/game/123?mode=multi">
          <button className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Multiplayer (Room: 123)
          </button>
        </Link>
      </div>
    </div>
  );
}