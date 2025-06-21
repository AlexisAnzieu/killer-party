"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  photoUrl: string | null;
  updatedAt: string;
}

interface OnlinePlayer extends Player {
  photoUrl: string;
}

export default function GameStatusPage() {
  const params = useParams();
  const { gameId } = params as { gameId: string };

  const [status, setStatus] = useState<string>("");
  const [alivePlayers, setAlivePlayers] = useState<OnlinePlayer[]>([]);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<OnlinePlayer[]>(
    []
  );
  const [winner, setWinner] = useState<Player | null>(null);
  const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [registrationLink, setRegistrationLink] = useState<string>("");

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      const data = await res.json();
      setStatus(data.status);
      setAlivePlayers(data.alivePlayers);
      setEliminatedPlayers(data.eliminatedPlayers);
      setWinner(data.winner);
      setOfflinePlayers(data.offlinePlayers || []);
    };
    fetchStatus();

    // Set the registration link when component mounts
    if (typeof window !== "undefined") {
      setRegistrationLink(`${window.location.origin}/games/${gameId}/login`);
    }
  }, [gameId]);

  const updateStatus = async (newStatus: string) => {
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to copy link: ", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center">
        🎮 Configuration
      </h1>

      {status === "NOT_STARTED" && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black bg-opacity-50 backdrop-blur-md border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md mx-4">
          <h2 className="text-xl sm:text-2xl font-bold ">
            📩 Inviter des joueurs
          </h2>
          <p className="text-sm text-center text-gray-200 mb-2">
            Partagez ce lien aux participants pour qu&apos;ils puissent
            s&apos;inscrire à la partie :
          </p>
          <div
            onClick={copyToClipboard}
            className="w-full p-3 rounded-lg bg-purple-900 bg-opacity-50 border border-purple-400 flex items-center justify-between cursor-pointer hover:bg-opacity-70 transition-all duration-300"
          >
            <span className="text-purple-200 font-mono text-sm truncate">
              {registrationLink}
            </span>
            <div className="flex items-center gap-2 text-purple-200 shrink-0">
              {linkCopied ? (
                <span className="text-green-400">✓ Copié!</span>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Copier</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-300 italic">
            Cliquez sur le lien pour le copier
          </p>
        </div>
      )}

      <div className="mb-4 sm:mb-6 flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xs">
        {status === "NOT_STARTED" && (
          <button
            onClick={() => {
              updateStatus("IN_PROGRESS");
            }}
            className="w-full px-6 py-4 bg-green-500 text-white font-bold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-300 text-base sm:text-lg cursor-pointer"
          >
            Démarrer la Partie
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            onClick={() => {
              updateStatus("ENDED");
            }}
            className="w-full px-6 py-4 bg-red-500 text-white font-bold rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105 transition-all duration-300 text-base sm:text-lg cursor-pointer"
          >
            Terminer la Partie
          </button>
        )}

        {status === "ENDED" && (
          <div className="bg-black bg-opacity-40 backdrop-blur-sm p-4 rounded-xl border border-[#ff4ecd] text-center flex flex-col gap-3">
            <p className="text-lg font-bold text-[#ff4ecd]">
              La partie est terminée
            </p>
            <Link
              href={`/games/${gameId}/players/gallery`}
              className="px-4 py-2 bg-[#7a5fff] text-white font-medium rounded-lg shadow-[0_0_10px_rgba(122,95,255,0.3)] hover:shadow-[0_0_20px_rgba(122,95,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>🖼️ Voir la galerie des joueurs</span>
            </Link>
          </div>
        )}
      </div>

      {winner && (
        <div className="mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black bg-opacity-50 backdrop-blur-md border border-[#ff4ecd] shadow-[0_0_30px_rgba(255,78,205,0.4)] flex flex-col items-center gap-3 sm:gap-4 w-full max-w-sm mx-4">
          <h2 className="text-2xl sm:text-3xl font-bold glow-text animate-pulse">
            🏆 Gagnant !
          </h2>
          <p className="text-lg sm:text-xl font-semibold text-[#00ffe7] glow-cyan">
            {winner.name}
          </p>
          {winner.photoUrl && (
            <img
              src={winner.photoUrl}
              alt="Selfie du gagnant"
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-[#ff4ecd] shadow-[0_0_20px_rgba(255,78,205,0.5)]"
            />
          )}
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-700 ">
        🟢 Joueurs en Vie
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10 w-full max-w-4xl px-2 sm:px-4">
        {alivePlayers.map((p) => (
          <Link
            key={p.id}
            href={`/games/${gameId}/player/${p.id}`}
            className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.2)] hover:shadow-[0_0_20px_rgba(0,255,231,0.4)] hover:scale-105 transition-all duration-300"
          >
            <div className="flex flex-col items-center w-full">
              <p className="font-semibold text-[#00ffe7] text-sm sm:text-base truncate w-full text-center">
                {p.name}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Mis à jour {new Date(p.updatedAt).toLocaleString("fr-FR")}
              </p>
              <img
                src={p.photoUrl}
                alt="Selfie du joueur"
                className="w-60 h-60 sm:w-24 sm:h-24 object-cover rounded-full border-2 border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)]"
              />
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-red-500 ">
        🔴 Joueurs Éliminés
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl px-2 sm:px-4 opacity-60">
        {eliminatedPlayers.map((p) => (
          <Link
            key={p.id}
            href={`/games/${gameId}/player/${p.id}`}
            className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 border border-[#ff4ecd] shadow-[0_0_10px_rgba(255,78,205,0.2)]"
          >
            <div className="flex flex-col items-center w-full">
              <p className="font-semibold text-[#ff4ecd] text-sm sm:text-base truncate w-full text-center">
                {p.name}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Mis à jour {new Date(p.updatedAt).toLocaleString("fr-FR")}
              </p>
              <img
                src={p.photoUrl}
                alt="Selfie du joueur"
                className="w-60 h-60 sm:w-24 sm:h-24 object-cover rounded-full border-2 border-[#ff4ecd] shadow-[0_0_10px_rgba(255,78,205,0.3)]"
              />
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-400">
        ⚫ Joueurs non authentifiés
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl px-2 sm:px-4 opacity-60">
        {offlinePlayers.map((p) => (
          <Link
            key={p.id}
            href={`/games/${gameId}/player/${p.id}`}
            className="bg-black bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 border border-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.2)]"
          >
            <div className="flex flex-col items-center w-full">
              <p className="font-semibold text-gray-400 text-sm sm:text-base truncate w-full text-center">
                {p.name}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Mis à jour {new Date(p.updatedAt).toLocaleString("fr-FR")}
              </p>
              <div className="w-60 h-60 sm:w-24 sm:h-24 rounded-full bg-[#0d0221] border-2 border-gray-400 flex items-center justify-center text-gray-400 font-bold shadow-[0_0_10px_rgba(156,163,175,0.3)]">
                {p.name.charAt(0)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
