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

    setMessage("Selfie uploaded successfully!");
    router.push(`/games/${gameId}/player/${selectedPlayerId}`);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Player Login & Selfie Upload</h1>
      <select
        aria-label="Select your player name"
        value={selectedPlayerId}
        onChange={(e) => setSelectedPlayerId(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">Select your name</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <label htmlFor="selfie-upload" className="block mb-1 font-medium">Upload your selfie</label>
      <input
        id="selfie-upload"
        type="file"
        accept="image/*"
        title="Upload your selfie"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-4 w-full"
      />
      <button onClick={uploadSelfie} className="bg-green-500 text-white px-4 py-2 rounded">
        Upload Selfie
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
