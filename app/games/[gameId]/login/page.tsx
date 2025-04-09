"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
}

export default function PlayerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const { gameId } = params as { gameId: string };

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      const data = await res.json();
      setPlayers([...data.alivePlayers, ...data.eliminatedPlayers]);
    };
    fetchPlayers();
  }, [gameId]);

  const uploadSelfie = async () => {
    if (!file || !selectedPlayerId) return;

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const photoUrl = data.url;

    await fetch(`/api/players/${selectedPlayerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl }),
    });

    setMessage("🎉 Selfie uploaded successfully!");
    router.push(`/games/${gameId}/player/${selectedPlayerId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-indigo-700 via-purple-500 to-pink-400 text-white animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-glow animate-pulse text-center">
        Player Login & Selfie Upload
      </h1>
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 w-full max-w-xl shadow-lg flex flex-col gap-6">
        <select
          aria-label="Select your player name"
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="p-3 rounded-full text-black font-semibold shadow hover:scale-105 transition-transform"
        >
          <option value="">🎭 Select your name</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div>
          <label htmlFor="selfie-upload" className="block mb-2 font-semibold text-lg">📸 Upload your selfie</label>
          <input
            id="selfie-upload"
            type="file"
            accept="image/*"
            title="Upload your selfie"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full p-3 rounded-full text-black font-semibold shadow hover:scale-105 transition-transform"
          />
        </div>
        <button
          onClick={uploadSelfie}
          className="bg-yellow-300 text-purple-800 font-bold px-6 py-3 rounded-full shadow-lg hover:scale-110 hover:bg-yellow-400 transition-transform duration-300 ease-out animate-bounce"
        >
          🚀 Upload Selfie
        </button>
        {message && (
          <p className="text-green-300 font-bold text-center animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}
