"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewGamePage() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [playersText, setPlayersText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Killer Game</h1>
      <input
        type="text"
        placeholder="Game name (optional)"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <h2 className="text-xl font-semibold mb-2">Add Players</h2>
      <textarea
        placeholder="Enter one player name per line"
        value={playersText}
        onChange={(e) => setPlayersText(e.target.value)}
        className="border p-2 mb-4 w-full h-40"
      />
      <button onClick={createGame} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
        Create Game & Add Players
      </button>
    </div>
  );
}
