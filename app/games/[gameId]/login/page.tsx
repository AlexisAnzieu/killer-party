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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
        Player Login & Selfie Upload
      </h1>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-3xl p-8 w-full max-w-xl border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-6">
        <select
          aria-label="Select your player name"
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          className="p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300"
        >
          <option value="">🎭 Select your name</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div>
          <label htmlFor="selfie-upload" className="block mb-2 font-semibold text-lg text-[#ff4ecd] glow-text">📸 Upload your selfie</label>
          <input
            id="selfie-upload"
            type="file"
            accept="image/*"
            title="Upload your selfie"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#7a5fff] shadow-[0_0_10px_rgba(122,95,255,0.3)] hover:shadow-[0_0_20px_rgba(122,95,255,0.5)] hover:scale-105 transition-all duration-300 file:bg-[#7a5fff] file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full file:font-bold file:hover:bg-[#ff4ecd] file:transition-colors file:duration-300"
          />
        </div>
        <button
          onClick={uploadSelfie}
          className="bg-[#ff4ecd] text-white font-bold px-6 py-3 rounded-full shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-110 transition-all duration-300"
        >
          🚀 Upload Selfie
        </button>
        {message && (
          <p className="text-[#00ffe7] font-bold text-center animate-pulse glow-cyan">{message}</p>
        )}
      </div>
    </div>
  );
}
