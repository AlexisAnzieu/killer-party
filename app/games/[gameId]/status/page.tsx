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

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      const data = await res.json();
      setStatus(data.status);
      setAlivePlayers(data.alivePlayers);
      setEliminatedPlayers(data.eliminatedPlayers);
      setWinner(data.winner);
    };
    fetchStatus();
  }, [gameId]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Game Status</h1>
      <p className="mb-4">Status: <strong>{status}</strong></p>

      {winner && (
        <div className="mb-6 p-4 border rounded bg-green-100">
          <h2 className="text-xl font-semibold mb-2">Winner!</h2>
          <p>{winner.name}</p>
          <img src={winner.photoUrl ?? undefined} alt="Winner selfie" className="w-32 h-32 object-cover rounded-full" />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Alive Players</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {alivePlayers.map((p) => (
          <div key={p.id} className="border p-2 rounded text-center">
            <p>{p.name}</p>
            {p.photoUrl ? (
              <img src={p.photoUrl ?? undefined} alt="Player selfie" className="w-24 h-24 object-cover rounded-full mx-auto" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                <span className="text-gray-600">{p.name.charAt(0)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">Eliminated Players</h2>
      <div className="grid grid-cols-2 gap-4">
        {eliminatedPlayers.map((p) => (
          <div key={p.id} className="border p-2 rounded text-center opacity-50">
            <p>{p.name}</p>
            {p.photoUrl ? (
              <img src={p.photoUrl ?? undefined} alt="Player selfie" className="w-24 h-24 object-cover rounded-full mx-auto" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                <span className="text-gray-600">{p.name.charAt(0)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
