"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  photoUrl: string | null;
}

export default function GameStatusPage() {
  const params = useParams();
  const { gameId } = params as { gameId: string };

  const [status, setStatus] = useState<string>("");
  const [alivePlayers, setAlivePlayers] = useState<Player[]>([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      const data = await res.json();
      setStatus(data.status);
      setNewStatus(data.status);
      setAlivePlayers(data.alivePlayers);
      setEliminatedPlayers(data.eliminatedPlayers);
      setWinner(data.winner);
    };
    fetchStatus();
  }, [gameId]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value);
  };

  const updateStatus = async () => {
    try {
      const res = await fetch(`/api/games/${gameId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12 bg-gradient-to-br from-indigo-800 via-purple-600 to-pink-400 text-white animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-glow animate-pulse text-center">
        🎮 Game Status
      </h1>
      <p className="mb-6 text-xl font-semibold">Status: <span className="text-yellow-300">{status}</span></p>

      <div className="mb-6 flex flex-col items-center gap-4">
        <label htmlFor="status-select" className="sr-only">Change Game Status</label>
        <select
          id="status-select"
          value={newStatus}
          onChange={handleStatusChange}
          className="text-black p-2 rounded"
        >
          <option value="NOT_STARTED">NOT_STARTED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="ENDED">ENDED</option>
        </select>
        <button
          onClick={updateStatus}
          className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition"
        >
          Update Status
        </button>
      </div>

      {winner && (
        <div className="mb-10 p-6 rounded-3xl bg-green-500 bg-opacity-30 backdrop-blur-md shadow-lg flex flex-col items-center gap-4">
          <h2 className="text-3xl font-bold animate-pulse">🏆 Winner!</h2>
          <p className="text-xl font-semibold">{winner.name}</p>
          {winner.photoUrl && (
            <img src={winner.photoUrl} alt="Winner selfie" className="w-32 h-32 object-cover rounded-full border-4 border-yellow-300" />
          )}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">🟢 Alive Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 w-full max-w-4xl">
        {alivePlayers.map((p) => (
          <div key={p.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-2 shadow hover:scale-105 transition-transform">
            <p className="font-semibold">{p.name}</p>
            {p.photoUrl ? (
              <img src={p.photoUrl} alt="Player selfie" className="w-24 h-24 object-cover rounded-full border-2 border-green-300" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-black font-bold">
                {p.name.charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">🔴 Eliminated Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl opacity-60">
        {eliminatedPlayers.map((p) => (
          <div key={p.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-2 shadow">
            <p className="font-semibold">{p.name}</p>
            {p.photoUrl ? (
              <img src={p.photoUrl} alt="Player selfie" className="w-24 h-24 object-cover rounded-full border-2 border-red-300" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-black font-bold">
                {p.name.charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
