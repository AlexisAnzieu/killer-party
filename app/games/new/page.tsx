"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewGamePage() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [playersText, setPlayersText] = useState("");
  const [gameId, setGameId] = useState<string | null>(null);

  const createGame = async () => {
    const playerNames = playersText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: gameName, playerNames }),
    });
    const data = await res.json();
    setGameId(data.gameId);
    router.push(`/games/${data.gameId}/status`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-pink-500 via-yellow-400 to-green-400 text-white animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-glow animate-pulse text-center">
        🎲 Create New Killer Game
      </h1>
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl shadow-lg flex flex-col gap-6">
        <input
          type="text"
          placeholder="Game name (optional)"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className="p-3 rounded-full text-black font-semibold shadow hover:scale-105 transition-transform"
        />
        <div>
          <h2 className="text-2xl font-bold mb-2">👥 Add Players</h2>
          <textarea
            placeholder="Enter one player name per line"
            value={playersText}
            onChange={(e) => setPlayersText(e.target.value)}
            className="p-3 rounded-3xl text-black font-semibold shadow hover:scale-105 transition-transform w-full h-40"
          />
        </div>
        <button
          onClick={createGame}
          className="bg-yellow-300 text-purple-800 font-bold px-6 py-3 rounded-full shadow-lg hover:scale-110 hover:bg-yellow-400 transition-transform duration-300 ease-out animate-bounce"
        >
          🚀 Create Game & Add Players
        </button>
      </div>
    </div>
  );
}
