"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OnlinePlayer extends Player {
  photoUrl: string;
}

interface Player {
  id: string;
  name: string;
  photoUrl: string | null;
}

export default function GameStatusPage() {
  const params = useParams();
  const { gameId } = params as { gameId: string };

  const [status, setStatus] = useState<string>("");
  const [alivePlayers, setAlivePlayers] = useState<OnlinePlayer[]>([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<OnlinePlayer[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
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
      setOfflinePlayers(data.offlinePlayers || []);
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
    <div className="min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center glow-text">
        🎮 État de la Partie
      </h1>
      <p className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold">Statut: <span className="text-[#00ffe7] glow-cyan">{status}</span></p>

      <div className="mb-4 sm:mb-6 flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xs">
        <label htmlFor="status-select" className="sr-only">Changer le Statut du Jeu</label>
        <select
          id="status-select"
          value={newStatus}
          onChange={handleStatusChange}
          className="w-full p-3 sm:p-4 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300"
        >
          <option value="NOT_STARTED">NON COMMENCÉ</option>
          <option value="IN_PROGRESS">EN COURS</option>
          <option value="ENDED">TERMINÉ</option>
        </select>
        <button
          onClick={updateStatus}
          className="w-full px-6 py-4 bg-[#ff4ecd] text-white font-bold rounded-full shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-105 transition-all duration-300 text-base sm:text-lg"
        >
          Mettre à Jour le Statut
        </button>
      </div>

      {winner && (
        <div className="mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black bg-opacity-50 backdrop-blur-md border border-[#ff4ecd] shadow-[0_0_30px_rgba(255,78,205,0.4)] flex flex-col items-center gap-3 sm:gap-4 w-full max-w-sm mx-4">
          <h2 className="text-2xl sm:text-3xl font-bold glow-text animate-pulse">🏆 Gagnant !</h2>
          <p className="text-lg sm:text-xl font-semibold text-[#00ffe7] glow-cyan">{winner.name}</p>
          {winner.photoUrl && (
            <img src={winner.photoUrl} alt="Selfie du gagnant" className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-[#ff4ecd] shadow-[0_0_20px_rgba(255,78,205,0.5)]" />
          )}
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-700 ">🟢 Joueurs en Vie</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10 w-full max-w-4xl px-2 sm:px-4">
        {alivePlayers.map((p) => (
          <Link key={p.id} href={`/games/${gameId}/player/${p.id}`} className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.2)] hover:shadow-[0_0_20px_rgba(0,255,231,0.4)] hover:scale-105 transition-all duration-300">
            <p className="font-semibold text-[#00ffe7] text-sm sm:text-base truncate w-full text-center">{p.name}</p>
           
              <img src={p.photoUrl} alt="Selfie du joueur" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full border-2 border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)]" />
           
          </Link>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-red-500 ">🔴 Joueurs Éliminés</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl px-2 sm:px-4 opacity-60">
        {eliminatedPlayers.map((p) => (
          <Link key={p.id} href={`/games/${gameId}/player/${p.id}`} className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 border border-[#ff4ecd] shadow-[0_0_10px_rgba(255,78,205,0.2)]">
            <p className="font-semibold text-[#ff4ecd] text-sm sm:text-base truncate w-full text-center">{p.name}</p>
              <img src={p.photoUrl} alt="Selfie du joueur" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full border-2 border-[#ff4ecd] shadow-[0_0_10px_rgba(255,78,205,0.3)]" />
           
          </Link>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-400">⚫ Joueurs hors ligne</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl px-2 sm:px-4 opacity-60">
        {offlinePlayers.map((p) => (
          <Link key={p.id} href={`/games/${gameId}/player/${p.id}`} className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 border border-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.2)]">
            <p className="font-semibold text-gray-400 text-sm sm:text-base truncate w-full text-center">{p.name}</p>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0d0221] border-2 border-gray-400 flex items-center justify-center text-gray-400 font-bold shadow-[0_0_10px_rgba(156,163,175,0.3)]">
              {p.name.charAt(0)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
